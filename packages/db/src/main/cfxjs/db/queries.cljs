(ns cfxjs.db.queries
  (:require
   [cfxjs.db.datascript.core :as db]
   [cfxjs.db.schema :refer [model->attr-keys]]
   [debux.cs.core :as d :refer-macros [clog clogn break clog_ clogn_  break_]]))

(declare q p e t fdb)

(defn j->c [a]
  (js->clj a :keywordize-keys true))

(defn get-one-account-by-group-and-nickname
  [{:keys [groupId nickname]}]
  (e :account
     (q '[:find ?e .
          :in $ ?gid ?eqnick
          :where
          [?g :accountGroup/account]
          [(= ?gid ?g)]
          [?g :accountGroup/account ?e]
          [?e :account/nickname ?nick]
          [(?eqnick ?nick)]]
        groupId #(or (not nickname) (= % nickname)))))

(defn get-one-account-by-group-and-index
  [{:keys [groupId index]}]
  (e :account
     (q '[:find ?e .
          :in $ ?gid ?idx
          :where
          [?g :accountGroup/account]
          [(= ?g ?gid)]
          [?g :accountGroup/account ?e]
          [?e :account/index ?idx]] groupId index)))

(defn get-address-network
  "get which network address from"
  [addr-id]
  (e :network (q '[:find ?n .
                   :in $ ?aid
                   :where
                   [?n :network/address ?aid]] addr-id)))

(defn get-account-account-group
  [account-id]
  (e :accountGroup (q '[:find ?g .
                        :in $ ?aid
                        :where
                        [?g :accountGroup/account ?aid]] account-id)))

(defn any-dup-nick-account
  [{:keys [accountId nickname]}]
  (boolean (q '[:find ?as .
                :in $ ?aid ?to-check-nick
                :where
                [?g :accountGroup/account ?aid]
                [?g :accountGroup/account ?as]
                [?as :account/nickname ?to-check-nick]]
              accountId nickname)))

(defn filter-account-group-by-network-type
  [network-type]
  (map #(e :accountGroup %) (if (= network-type "eth")
                                            ;; accountGroup without vault with
                                            ;; network-type "pub", cfxOnly true
                              (q '[:find [?g ...]
                                   :where
                                   [?g :accountGroup/vault ?v]
                                   [?v :vault/cfxOnly ?cfxOnly]
                                   [?v :vault/type ?vtype]
                                   (not [?v :vault/cfxOnly true]
                                        [?v :vault/type "pub"])])
                                            ;; all accountGroup
                              (q '[:find [?g ...]
                                   :where
                                   [?g :accountGroup/vault]]))))

(defn get-export-all-data
  []
  (let [to-export                #{"hdPath" "network" "vault" "accountGroup" "account" "address"}
        datoms                   (db/datoms
                                  (fdb (fn [db datom]
                                         (contains? to-export (namespace (.-a datom))))) :eavt)
        is-builtin-network-datom #(= :network/builtin (.-a %))
        builtin-entity-id        (reduce (fn [acc d]
                                           (if (and (is-builtin-network-datom d) (true? (.-v d)))
                                             (conj acc (.-e d))
                                             acc))
                                         #{1 2} datoms)
        datoms                   (filter #(not (contains? builtin-entity-id (.-e %))) datoms)]
    (clj->js (map
              (fn [d] [(.-e d) (str (namespace (.-a d)) "/" (name (.-a d))) (.-v d)])
              datoms))))

(defn set-current-account
  "set current selected account by wallet
   - v1
   find all app authed with the to-be-selected account and change their selected account
   - TODO: v2
   don't track app's selected account"
  [acc]
  (let [selected-account     (q '[:find ?a .
                                  :where
                                  [?a :account/selected true]])
        ;; set all accounts unselected
        acc-unselect         [[:db.fn/retractAttribute selected-account :account/selected]]
        ;; select account
        acc-select           [[:db/add acc :account/selected true]]
        ;; query app authed by to-be-selected account
        authed-app           (q '[:find [?app ...]
                                  :in $ ?acc
                                  :where
                                  [?app :app/account ?acc]] acc)
        authed-app-reselects (reduce (fn [ac app-eid]
                                       (concat ac [[:db.fn/retractAttribute app-eid :app/currentAccount]
                                                   [:db/add app-eid :app/currentAccount acc]]))
                                     [] authed-app)
        txns                 (concat acc-unselect acc-select authed-app-reselects)]
    (t txns)
    (map (partial e :app) authed-app)))

(defn set-current-network
  "set wallet current network, change all apps' currentNetwork"
  [net]
  (let [selected-net  (q '[:find ?net .
                           :where
                           [?net :network/selected true]])
        ;; unselect selected net
        net-unselect  [[:db.fn/retractAttribute selected-net :network/selected]]
        ;; select unselected net
        net-select    [[:db/add net :network/selected true]]
        ;; get all app
        apps          (q '[:find [?app ...]
                           :where
                           [?app :app/site]])
        apps-reselect (mapv (fn [app] [:db/add app :app/currentNetwork net]) apps)
        txns          (concat net-unselect net-select apps-reselect)]
    (t txns)
    (map (partial e :app) apps)))

(defn upsert-app-permissions
  [opt]
  (let [{:keys [siteId
                accounts
                perms
                currentNetwork
                currentAccount]}
        opt
        exist-app          (q '[:find ?app .
                                :in $ ?site
                                :where
                                [?app :app/site ?site]] siteId)
        _                  (when exist-app (t [[:db.fn/retractAttribute exist-app :app/account]
                                               [:db.fn/retractAttribute exist-app :app/currentAccount]
                                               [:db.fn/retractAttribute exist-app :app/currentNetowrk]
                                               [:db.fn/retractAttribute exist-app :app/perms]]))
        app                (or exist-app
                               (get-in  (t [[:db/add "newapp" :app/site siteId]])
                                        [:tempids "newapp"]))
        add-account-fn     (fn [acc-eid] [:db/add app :app/account acc-eid])
        add-perms          [[:db/add app :app/perms perms] [:db/add app :app/permUpdatedAt (.now js/Date)]]
        add-accounts       (map add-account-fn accounts)
        add-currentAccount [[:db/add app :app/currentAccount currentAccount]]
        add-currentNetowrk [[:db/add app :app/currentNetwork currentNetwork]]]
    (t (concat add-perms add-accounts add-currentNetowrk add-currentAccount))
    (e :app app)))

(defn addr-acc-network [{:keys [accountId addressId networkId]}]
  (cond addressId
        (let [{:keys [accountId networkId]}
              (q '[:find [?net ?acc]
                   :keys accountId networkId
                   :in $ ?addr
                   :where
                   [?net :network/address ?addr]
                   [?acc :account/address ?addr]] addressId)]
          {:accountId accountId
           :networkId networkId
           :addressId addressId})
        (and accountId networkId (not addressId))
        {:accountId accountId
         :networkId networkId
         :addressId (q '[:find ?addr .
                         :in $ ?acc ?net
                         :where
                         [?acc :account/address ?addr]
                         [?net :network/address ?addr]]
                       accountId networkId)}))

(defn account-addr-by-network
  [{:keys [account network]}]
  (->> {:accountId account :networkId network}
       addr-acc-network
       :addressId
       (e :address)))

(defn get-current-addr []
  (q '[:find ?addr .
       :where
       [?net :network/selected true]
       [?acc :account/selected true]
       [?acc :account/address ?addr]
       [?net :network/address ?addr]]))

(defn get-current-network []
  (q '[:find ?net .
       :where
       [?net :network/selected true]]))

(defn dbadd
  "add document to db with modal keyword
  eg. with params [1, :token,  {address: '0x0'} ]
  generate tx {:db/id 1 :token/address '0x0'}"
  [eid model document-map]
  (reduce
   (fn [acc [k v]]
     (assoc acc (keyword (str model "/" (name k))) v))
   {:db/id eid} document-map))

(defn add-token-to-addr [{:keys [address decimals image name symbol targetAddressId fromApp fromUser fromList checkOnly network]}]
  (let [addressId      targetAddressId
        networkId      network
        token-in-net?  (q '[:find ?t .
                            :in $ ?taddr ?net
                            :where
                            [?t :token/address ?taddr]
                            [?net :network/token ?t]]
                          address networkId)
        token-in-addr? (and token-in-net?
                            (q '[:find ?t .
                                 :in $ ?taddr ?addr
                                 :where
                                 [?t :token/address ?taddr]
                                 [?addr :address/token ?t]]
                               address addressId))
        token-id       (or token-in-addr? token-in-net? -1)
        add-token-tx   {:db/id token-id :token/name name :token/symbol symbol :token/address address :token/decimals decimals :token/logoURI image}
        add-token-tx   (if fromApp (assoc add-token-tx :token/fromApp true) add-token-tx)
        add-token-tx   (if fromUser (assoc add-token-tx :token/fromUser true) add-token-tx)
        add-token-tx   (if fromList (assoc add-token-tx :token/fromList true) add-token-tx)
        tx             [add-token-tx]
        tx             (if token-in-addr? tx (conj tx {:db/id addressId :address/token token-id}
                                                   {:db/id "new-balance" :balance/value "0x0"}
                                                   {:db/id addressId :address/balance "new-balance"}
                                                   {:db/id token-id :token/balance "new-balance"}))
        tx             (if token-in-net? tx (conj tx {:db/id networkId :network/token token-id}))
        tx-rst         (and (not checkOnly) (t tx))
        token-id       (if (and (not checkOnly) (= token-id -1)) (get-in tx-rst [:tempids -1]) token-id)]
    {:tokenId       token-id
     :alreadyInNet  (boolean token-in-net?)
     :alreadyInAddr (boolean token-in-addr?)}))

(defn get-network-token-by-token-addr [{:keys [networkId tokenAddress]}]
  (q '[:find ?tokenId .
       :in $ ?net ?addr
       :where
       [?net :network/token ?tokenId]
       [?tokenId :token/address ?addr]]
     networkId tokenAddress))

(defn addr-network-id-to-addr-id [addr netId]
  (q '[:find ?addr-id .
       :in $ ?addr ?net
       :where
       (or [?addr-id :address/base32 ?addr]
           [?addr-id :address/hex ?addr])
       [?net :network/address ?addr-id]]
     addr netId))
(defn addr-network-id-to-token-id [addr netId]
  (q '[:find ?token-id .
       :in $ ?addr ?net
       :where
       [?token-id :token/address ?addr]
       [?net :network/token ?token-id]]
     addr netId))

(defn get-account-group-by-vault-type [type]
  (->> (q '[:find [?g ...]
            :in $ ?type
            :where
            [?g :accountGroup/vault ?v]
            [?v :vault/type ?type]]
          type)
       (mapv #(e :accountGroup %))))

(defn get-single-call-balance-params [{:keys [type allNetwork]}]
  (let [discover?            (= type "discover")
        refresh?             (= type "refresh")
        all?                 (= type "all")
        native-balance-binds (q '[:find ?net ?addr ?token
                                  :in $ ?allnet
                                  :where
                                  [?net :network/address ?addr-id]
                                  (or
                                   [(true? ?allnet)]
                                   (and
                                    [(not ?allnet)]
                                    [?net :network/selected true]))
                                  [?addr-id :address/hex ?addr-hex]
                                  [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]
                                  [(and true "0x0") ?token]] allNetwork)
        has-balance-binds    (if (or refresh? all?)
                               (q '[:find ?net ?addr ?token
                                    :in $ ?allnet
                                    :where
                                    [?net :network/token ?token-id]
                                    (or
                                     [(true? ?allnet)]
                                     (and
                                      [(not ?allnet)]
                                      [?net :network/selected true]))
                                    [?balance :balance/address ?addr-id]
                                    [?balance :balance/token  ?token-id]
                                    [?token-id :token/address ?token]
                                    [?addr-id :address/hex ?addr-hex]
                                    [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]] allNetwork)
                               #{})
        no-balance-binds     (if (or all? discover?)
                               (q '[:find ?net ?addr ?token
                                    :in $ ?allnet
                                    :where
                                    [?net :network/address ?addr-id]
                                    [?net :network/token ?token-id]
                                    (or
                                     [(true? ?allnet)]
                                     (and
                                      [(not ?allnet)]
                                      [?net :network/selected true]))
                                    (not [?addr-id :address/token ?token-id])
                                    [?token-id :token/address ?token]
                                    [?addr-id :address/hex ?addr-hex]
                                    [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]] allNetwork)
                               #{})
        format-balance-binds (fn [acc [network-id uaddr taddr]]
                               (let [[u t net] (get acc network-id [#{} #{} (e :network network-id)])]
                                 (assoc acc network-id [(conj u uaddr) (conj t taddr) net])))
        params               (reduce format-balance-binds {} native-balance-binds)
        params               (reduce format-balance-binds params has-balance-binds)
        params               (reduce format-balance-binds params no-balance-binds)]
    (into [] params)))

(defn upsert-balances [{:keys [networkId data]}]
  (let [formated-data
        (reduce
         (fn [acc [uaddr tokens-map]]
           (into acc
                 (reduce
                  (fn [acc [taddr balance]]
                    (if (= balance "0x0")
                      acc
                      (conj acc [(addr-network-id-to-addr-id (name uaddr) networkId) (addr-network-id-to-token-id (name taddr) networkId) balance])))
                  []
                  tokens-map)))
         [] data)

        formated-data (q '[:find ?u ?t ?balance ?b
                           :in $ [[?u ?t ?balance]]
                           :where
                           (or
                            (and
                             [?u :address/balance ?b]
                             [?t :token/balance ?b])
                            [(and true false) ?b])]
                         formated-data)

        ;; [
        ;;   [uid tid balance balance-id]
        ;; ]

        txs
        (reduce
         (fn [acc [uid tid value balance-id]]
           (let [tmpid (str "newbalance-" uid "-" tid)]
             (into acc
                   (cond
                     balance-id           [{:db/id balance-id :balance/value value}]
                     (and uid (nil? tid)) [{:db/id uid :address/nativeBalance value}]
                     (and uid tid)        [{:db/id tmpid :balance/value value}
                                           {:db/id uid :address/balance tmpid :address/token tid}
                                           {:db/id tid :token/balance tmpid}]))))
         []
         formated-data)]
    (t txs)
    true))

(defn retract [id] (t [[:db.fn/retractEntity id]]))
(defn retract-attr [{:keys [eid attr]}] (t [[:db.fn/retractAttribute eid (keyword attr)]]))

(defn retract-address-token [{:keys [tokenId addressId]}]
  (let [has-token?            (q '[:find ?token .
                                   :in $ ?token ?addr
                                   :where
                                   [?addr :address/token ?token]]
                                 tokenId addressId)
        has-balance?          (and has-token? (q '[:find ?b .
                                                   :in $ ?token ?addr
                                                   :where
                                                   [?addr :address/balance ?b]
                                                   [?token :token/balance ?b]]
                                                 tokenId addressId))
        token                 (and has-token? (e :token tokenId))
        ;; token not from toke list get deleted when link to zero addr
        not-from-list?        (and has-token? (not (:token/fromList token)))
        no-other-linked-addr? (and not-from-list? (-> (q '[:find [?addr ...]
                                                           :in $ ?token
                                                           :where
                                                           [?addr :address/token ?token]]
                                                         tokenId)
                                                      count
                                                      (= 1)))
        tx                    (if has-token? [[:db/retract addressId :address/token tokenId]
                                              [:db.fn/retractAttribute tokenId :token/fromUser]]
                                  [])
        tx                    (if no-other-linked-addr? (conj tx [:db.fn/retractEntity tokenId]) tx)
        ;; retract token will retract its balance automatically
        ;; so there's no need to retract balance if no-other-linked-addr? is true
        tx                    (if (and (not no-other-linked-addr?) has-balance?) (conj tx [:db.fn/retractEntity has-balance?]) tx)]
    (if has-token? (t tx) false)))

(defn get-from-address [{:keys [networkId address appId]}]
  (->> (q '[:find ?addr-id .
            :in $ ?netId ?addr ?app-id
            :where
            [?netId :network/type ?net-type]
            [?netId :network/address ?addr-id]
            [?acc :account/address ?addr-id]
            (or (and [?addr-id :address/base32 ?addr]
                     [(= ?net-type "cfx")])
                (and [?addr-id :address/hex ?addr]
                     [(= ?net-type "eth")]))
            (or [?app-id :app/account ?acc]
                [(not ?app-id)])
            [?addr-id :address/vault ?vault]
            [?vault :vault/type ?vault-type]
            [(not= ?vault-type pub)]]
          networkId address appId)
       (e :address)))

(defn get-addr-from-network-and-address [{:keys [networkId address]}]
  (->> (q '[:find ?addr .
            :in $ ?net ?address
            :where
            [?net :network/address ?addr]
            [?net :network/type ?net-type]
            (or
             (and [?addr :address/base32 ?address]
                  [(= ?net-type "cfx")])
             (and [?addr :address/hex ?address]
                  [(= ?net-type "eth")]))]
          networkId address)
       (e :address)))

(defn get-addr-tx-by-hash [{:keys [addressId txhash]}]
  (->> (q '[:find ?tx .
            :in $ ?addr ?hash
            :where
            [?tx :tx/hash ?hash]
            [?addr :address/tx ?tx]]
          addressId txhash)
       (e :tx)))

(defn get-unfinished-tx
  "Get tx that is not failed or confirmed"
  []
  (->> (q '[:find ?tx ?addr ?net
            :where
            [?tx :tx/status ?status]
            [(>= ?status 0)]
            [(< ?status 5)]
            [?addr :address/tx ?tx]
            [?net :network/address ?addr]])
       (mapv (fn [[tx-id addr-id net-id]]
               ;; {:tx      (e :tx tx-id)
               ;;  :address (e :address addr-id)}
               {:tx      tx-id
                :network (e :network net-id)
                :address (e :address addr-id)}))))

(defn set-tx-skipped [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status -2}]))
(defn set-tx-failed [{:keys [hash error]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status -1 :tx/err error}]))
(defn set-tx-unsent [{:keys [hash]}]
  (t [{:db/id [:tx/hash hash] :tx/status 0}]))
(defn set-tx-sending [{:keys [hash]}]
  (t [{:db/id [:tx/hash hash] :tx/status 1}]))
(defn set-tx-pending [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 2}]))
(defn set-tx-packaged [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 3}]))
(defn set-tx-executed [{:keys [hash receipt]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 4 :tx/receipt receipt}]))
(defn set-tx-confirmed [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 5}]))

;;; UI QUERIES
(defn home-page-assets
  ([] (home-page-assets {}))
  ([{:keys [include-other-tokens]}]
   (let [cur-addr          (e :address (get-current-addr))
         cur-net           (e :network (get-current-network))
         native-token-info (get cur-net :network/ticker {:name "CFX", :symbol "CFX", :decimals 18})
         native-token-ui   (assoc native-token-info :balance (get cur-addr :address/nativeBalance "0x0") :native true :added true)
         addr-tokens-info  (q '[:find ?token-id ?tbalance
                                :in $ ?cur-addr
                                :where
                                [?cur-addr :address/token ?token-id]
                                [?cur-addr :address/balance ?b]
                                [?token-id :token/balance ?b]
                                [?b :balance/value ?tbalance]]
                              (:db/id cur-addr))
         addr-tokens-info  (reduce
                            (fn [acc [token-id balance]]
                              (let [t (.toMap (e :token token-id))]
                                (conj acc (assoc t :balance balance :added true))))
                            [] addr-tokens-info)
         other-tokens-info (if  include-other-tokens
                             (q '[:find ?token-id ?tbalance
                                  :in $ ?cur-addr ?cur-net
                                  :where
                                  [?cur-net :network/token ?token-id]
                                  (not [?cur-addr :address/token ?token-id])
                                  [(and true "0x0") ?tbalance]]
                                (:db/id cur-addr) (:db/id cur-net))
                             #{})

         other-tokens-info (reduce
                            (fn [acc [token-id balance]]
                              (let [t (.toMap (e :token token-id))]
                                (conj acc (assoc t :balance balance :added false))))
                            []  other-tokens-info)
         rst               {:currentAddress cur-addr
                            :currentNetwork cur-net
                            :native         native-token-ui
                            :added          addr-tokens-info}
         rst               (if include-other-tokens (assoc rst :others other-tokens-info) rst)]
     rst)))

(defn get-add-token-list [] (home-page-assets {:include-other-tokens true}))

(defn account-list-assets []
  (let [cur-addr (e :address (get-current-addr))
        cur-net  (e :network (get-current-network))
        data     (q '[:find ?group ?acc ?addr
                      :in $ ?cur-net
                      :where
                      [?group :accountGroup/account ?acc]
                      [?acc :account/address ?addr]
                      [?cur-net :network/address ?addr]]
                    (:db/id cur-net))
        data     (reduce
                  (fn [acc [g account addr]]
                    (let [group          (get acc g (assoc (.toMap (e :accountGroup g)) :account {}))
                          touchedAccount (get-in group [:account account] (assoc (.toMap (e :account account)) :currentAddress (e :address addr)))
                          group          (assoc-in group [:account account] touchedAccount)]
                      (assoc acc g group)))
                  {} data)]

    {:currentAddress cur-addr
     :currentNetwork cur-net
     :accountGroups  data}))

(def queries {:batchTx
              (fn [txs]
                (let [txs (-> txs js/window.JSON.parse j->c)
                      txs (map (fn [[e a v]] [:db/add e (keyword a) v]) txs)
                      rst (t txs)]
                  (clj->js rst)))

              :getOneAccountByGroupAndNickname get-one-account-by-group-and-nickname
              :getOneAccountByGroupAndIndex    get-one-account-by-group-and-index
              :getAddressNetwork               get-address-network
              :getAccountAccountGroup          get-account-account-group
              :anyDupNickAccount               any-dup-nick-account
              :filterAccountGroupByNetworkType filter-account-group-by-network-type
              :getExportAllData                get-export-all-data
              :setCurrentAccount               set-current-account
              :setCurrentNetwork               set-current-network
              :upsertAppPermissions            upsert-app-permissions
              :accountAddrByNetwork            account-addr-by-network
              :retract                         retract
              :retractAttr                     retract-attr
              :getNetworkTokenByTokenAddr      get-network-token-by-token-addr
              :getCurrentAddr                  #(e :address (get-current-addr))
              :addTokenToAddr                  add-token-to-addr
              :getSingleCallBalanceParams      get-single-call-balance-params
              :upsertBalances                  upsert-balances
              :retractAddressToken             retract-address-token
              :getFromAddress                  get-from-address
              :getAddrFromNetworkAndAddress    get-addr-from-network-and-address
              :getAddrTxByHash                 get-addr-tx-by-hash
              :getUnfinishedTx                 get-unfinished-tx
              :setTxSkipped                    set-tx-skipped
              :setTxFailed                     set-tx-failed
              :setTxSending                    set-tx-sending
              :setTxPending                    set-tx-pending
              :setTxPackaged                   set-tx-packaged
              :setTxExecuted                   set-tx-executed
              :setTxConfirmed                  set-tx-confirmed
              :setTxUnsent                     set-tx-unsent

              :queryhomePageAssets        home-page-assets
              :queryaddTokenList          get-add-token-list
              :queryaccountListAssets     account-list-assets
              :getAccountGroupByVaultType get-account-group-by-vault-type})

(defn apply-queries [conn qfn pfn entity tfn ffn]
  (def q qfn)
  (def p pfn)
  (def e (fn [model eid] (entity model (model->attr-keys model) eid)))
  (def t tfn)
  (def fdb ffn)
  (reduce-kv
   (fn
     [acc k v]
     (if
      (get acc k)
       acc
       (assoc acc k
              (comp clj->js v j->c))))
   conn
   queries))

(comment
  (tap> (->> (q '[:find [?tx ...]
                  :where
                  [?tx :tx/payload _]])
             first
             (e :tx)
             .toMap)))