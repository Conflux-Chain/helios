(ns cfxjs.db.queries
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.schema :refer [model->attr-keys]]))

(declare q p e t fdb)

(defn j->c [a]
  (js->clj a :keywordize-keys true))

(defn get-one-account-by-group-and-nickname
  [{:keys [groupId nickname]}]
  (e :account
     (first (q '[:find [?e ...]
                 :in $ ?gid ?eqnick
                 :where
                 [?g :accountGroup/account]
                 [(= ?gid ?g)]
                 [?g :accountGroup/account ?e]
                 [?e :account/nickname ?nick]
                 [(?eqnick ?nick)]]
               groupId #(or (not nickname) (= % nickname))))))

(defn get-one-account-by-group-and-index
  [{:keys [groupId index]}]
  (e :account
     (first (q '[:find [?e ...]
                 :in $ ?gid ?idx
                 :where
                 [?g :accountGroup/account]
                 [(= ?g ?gid)]
                 [?g :accountGroup/account ?e]
                 [?e :account/index ?idx]] groupId index))))

(defn get-address-network
  "get which network address from"
  [addr-id]
  (e :network (first (q '[:find [?n ...]
                          :in $ ?aid
                          :where
                          [?n :network/address ?aid]] addr-id))))

(defn get-account-account-group
  [account-id]
  (e :accountGroup (first (q '[:find [?g ...]
                               :in $ ?aid
                               :where
                               [?g :accountGroup/account ?aid]] account-id))))

(defn any-dup-nick-account
  [{:keys [accountId nickname]}]
  (boolean (first (q '[:find [?as ...]
                       :in $ ?aid ?to-check-nick
                       :where
                       [?g :accountGroup/account ?aid]
                       [?g :accountGroup/account ?as]
                       [?as :account/nickname ?to-check-nick]]
                     accountId nickname))))

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
        datoms                   (d/datoms
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
  (let [selected-account     (first (q '[:find [?a ...]
                                         :where
                                         [?a :account/selected true]]))
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
  (let [selected-net  (first (q '[:find [?net ...]
                                  :where
                                  [?net :network/selected true]]))
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
        exist-app          (first (q '[:find [?app ...]
                                       :in $ ?site
                                       :where
                                       [?app :app/site ?site]] siteId))
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
         :addressId (first (q '[:find [?addr ...]
                                :in $ ?acc ?net
                                :where
                                [?acc :account/address ?addr]
                                [?net :network/address ?addr]]
                              accountId networkId))}))

(defn account-addr-by-network
  [{:keys [account network]}]
  (->> {:accountId account :networkId network}
       addr-acc-network
       :addressId
       (e :address)))

(defn get-current-addr []
  (-> (q '[:find [?addr]
           :where
           [?net :network/selected true]
           [?acc :account/selected true]
           [?acc :account/address ?addr]
           [?net :network/address ?addr]])
      first))

(defn dbadd
  "add document to db with modal keyword
  eg. with params [1, :token,  {address: '0x0'} ]
  generate tx {:db/id 1 :token/address '0x0'}"
  [eid model document-map]
  (reduce
   (fn [acc [k v]]
     (assoc acc (keyword (str model "/" (name k))) v))
   {:db/id eid} document-map))

(defn add-token-to-addr [{:keys [address targetAddressId fromApp fromUser fromList checkOnly]}]
  (let [{:keys [addressId networkId]} (addr-acc-network {:addressId targetAddressId})
        token-in-net?                 (-> (q '[:find [?t ...]
                                               :in $ ?taddr ?net
                                               :where
                                               [?t :token/address ?taddr]
                                               [?net :network/token ?t]]
                                             address networkId)
                                          not-empty
                                          first)
        token-in-addr?                (and token-in-net?
                                           (-> (q '[:find [?t ...]
                                                    :in $ ?taddr ?addr
                                                    :where
                                                    [?t :token/address ?taddr]
                                                    [?addr :address/token ?t]]
                                                  address addressId)
                                               not-empty
                                               first))
        token-id                      (or token-in-addr? token-in-net? -1)
        add-token-tx                  [:db/id token-id]
        add-token-tx                  (if fromApp (into add-token-tx [:token/fromApp true]) add-token-tx)
        add-token-tx                  (if fromUser (into add-token-tx [:token/fromUser true]) add-token-tx)
        add-token-tx                  (if fromList (into add-token-tx [:token/fromList true]) add-token-tx)
        tx                            [add-token-tx]
        tx                            (if token-in-addr? tx (conj tx [:db/id addressId :address/token token-id]))
        tx                            (if token-in-net? tx (conj tx [:db/id networkId :network/token token-id]))
        tx-rst                        (and (not checkOnly) (t tx))
        token-id                      (if (and (not checkOnly) (= token-id -1)) (get-in tx-rst [:tempids -1]) token-id)]
    {:tokenId       token-id
     :alreadyInNet  (boolean token-in-net?)
     :alreadyInAddr (boolean token-in-addr?)}))

(defn get-network-token-by-token-addr [{:keys [networkId tokenAddress]}]
  (-> (q '[:find [?tokenId]
           :in $ ?net ?addr
           :where
           [?net :network/token ?tokenId]
           [?tokenId :token/address ?addr]]
         networkId tokenAddress)
      first))

(defn addr-network-id-to-addr-id [addr netId]
  (-> (q '[:find [?addr-id ...]
           :in $ ?addr ?net
           :where
           (or [?addr-id :address/base32 ?addr]
               [?addr-id :address/hex ?addr])
           [?net :network/address ?addr-id]]
         addr netId)
      first))
(defn addr-network-id-to-token-id [addr netId]
  (-> (q '[:find [?token-id ...]
           :in $ ?addr ?net
           :where
           [?token-id :token/address ?addr]
           [?net :network/token ?token-id]]
         addr netId)
      first))

(defn get-single-call-balance-params [{:keys [type]}]
  (let [discover?            (= type "discover")
        refresh?             (= type "refresh")
        all?                 (= type "all")
        native-balance-binds (q '[:find ?net ?addr ?token
                                  :where
                                  [?net :network/address ?addr-id]
                                  [?addr-id :address/hex ?addr-hex]
                                  [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]
                                  [(and true "0x0") ?token]])
        has-balance-binds    (if (or refresh? all?)
                               (q '[:find ?net ?addr ?token
                                    :where
                                    [?balance :balance/address ?addr-id]
                                    [?balance :balance/token  ?token-id]
                                    [?token-id :token/address ?token]
                                    [?net :network/token   ?token-id]
                                    [?addr-id :address/hex ?addr-hex]
                                    [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]])
                               #{})
        no-balance-binds     (if (or all? discover?)
                               (q '[:find ?net ?addr ?token
                                    :where
                                    [?net :network/address ?addr-id]
                                    [?net :network/token ?token-id]
                                    (not [?addr-id :address/token ?token-id])
                                    [?token-id :token/address ?token]
                                    [?addr-id :address/hex ?addr-hex]
                                    [(get-else $ ?addr-id :address/base32 ?addr-hex) ?addr]])
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

        ;; [
        ;;   [uid tid balance]
        ;; ]

        txs
        (mapv
         (fn [[uid tid value]]
           (let [balance (e :balance [:balance/address+token [uid tid]])]
             (cond
               balance              [:db/add (:db/id balance) :balance/value value]
               (and uid (nil? tid)) [:db/add uid :address/balance value]
               (and uid tid)        {:db/id (str "newbalance-" uid "-" tid) :balance/token tid :balance/address uid :balance/value value})))
         formated-data)]
    (t txs)
    true))

(defn retract [id] (t [[:db.fn/retractEntity id]]))
(defn retract-attr [{:keys [eid attr]}] (t [[:db.fn/retractAttribute eid (keyword attr)]]))

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
              :getCurrentAddr                  (comp #(e :address) get-current-addr)
              :addTokenToAddr                  add-token-to-addr
              :getSingleCallBalanceParams      get-single-call-balance-params
              :upsertBalances                  upsert-balances})

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
