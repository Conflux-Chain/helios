(ns cfxjs.db.queries
  (:require
   [medley.core :refer [deep-merge]]
   ["@ethersproject/bignumber" :as bn]
   [clojure.walk :refer [postwalk walk]]
   [cfxjs.spec.cljs]
   [cfxjs.db.datascript.core :as db]
   [cfxjs.db.schema :refer [model->attr-keys]]))

(declare q p pm e t fdb)

(defn j->c [a]
  (cfxjs.spec.cljs/js->clj a :keywordize-keys true))

(defn map->nsmap
  "Apply the string n to the supplied structure m as a namespace."
  [m n]
  (postwalk
   (fn [x]
     (if (keyword? x)
       (keyword n x)
       x))
   m))

(defn- jsp-walk-outer [x]
  (let [rst (into [] x)
        rst (mapv (fn [[k v]] (if (nil? v) k {k v})) rst)]
    (conj rst)))

(defn- reverse-k? [k]
  (-> k name first (= "_")))
(defn- reverse-k [k]
  (if (reverse-k? k)
    (-> k name (.substr 1) keyword)
    (->> k name (str "_") keyword)))
(defn- ->reversed [k]
  (if (reverse-k? k) k (reverse-k k)))
(defn- ->un-reversed [k]
  (if (reverse-k? k) (reverse-k k) k))
(defn- jsp-walk-inner
  ([x] (jsp-walk-inner [] x))
  ([p [x y]]
   (let [p?         (seq p)
         my?        (map? y)
         dbid?      (and (= y 1) (= x :eid))
         x-reverse? (reverse-k? x)
         [xu xr]    [(->un-reversed x) (->reversed x)]
         k          (cond (not p?)   xu
                          dbid? :db/id
                          x-reverse? (keyword xu (second (last p)))
                          :else      (keyword (first (last p)) x))
         v          (cond
                      my?                      (walk (partial jsp-walk-inner (conj p [xu xr])) jsp-walk-outer y)
                      dbid? nil
                      (= y 1)                  nil
                      (= y 0)                  '[*]
                      :else                    (throw (js/Error. (str "Invalid pull patter g: " x ":" y))))]
     [k v])))

(defn jsp->p [jsp]
  (if (seq jsp)
    (let [vs (vals jsp)]
      (cond
        (some #(= % 0) vs)
        '[*]
        (some map? vs)
        (reduce into (mapcat (fn [m] (vals m)) (walk jsp-walk-inner jsp-walk-outer jsp)))
        :else
        (throw (js/Error. (str "Invalid pull pattern" jsp)))))
    [:db/id]))

(defn prst->js [prst]
  (postwalk
   (fn [x]
     (cond
       (and (keyword? x) (= (first (name x)) "_")) (keyword (name x) (namespace x))
       (= :db/id x) :db/eid
       :else x))
   prst))

(comment
  (prn (jsp->p {:accountGroup {:vault {:type 1 :data 1 :ddata 1}
                               :account {:eid 1}}}))
  (prn (p (jsp->p {:address {:_account {:_accountGroup {:vault {:eid 1}}}}})
          214))
  ;; findAddress
  (do (prn "11111")
      (prn (jsp->p {:address {:_account {:_accountGroup {:nickname 1
                                                         :vault {:eid 1}}
                                         :index         1}
                              :hex      1
                              :network {:name 1}}})))

  (p (jsp->p {:address {:_account {:_accountGroup {:nickname 1}
                                   :index         1}
                        :hex      1
                        :network {:name 1}}})
     214)
  (-> (p [{:account/_address [{:accountGroup/_account [:accountGroup/nickname]}
                              :account/index]}
          :address/hex
          {:address/network [:network/name]}]
         214)
      prst->js
      clj->js
      js/console.log))

(defn new-address-tx [{:keys [value network eid hex] :as addr}]
  (let [value (and (string? value) (.toLowerCase value))
        hex (and (string? value) (.toLowerCase hex))
        addr (if hex (assoc addr :hex hex) addr)
        addr (if value (assoc addr :value value) addr)
        eid (if (pos-int? eid)
              eid
              (try (:db/id (p [:db/id] [:address/id [network value]]))
                   (catch js/Error _ eid)))
        oldaddr? (pos-int? eid)
        addr (dissoc addr :eid)
        addr (if oldaddr? (dissoc addr :network :value) addr)]
    {:eid eid :address addr}))
(defn new-token-tx [{:keys [address network eid] :as token}]
  (let [address (and (string? address) (.toLowerCase address))
        eid (if (pos-int? eid)
              eid
              (try (:db/id (p [:db/id] [:token/id [network address]]))
                   (catch js/Error _ eid)))
        oldtoken? (pos-int? eid)
        token (dissoc token :eid)
        token (if oldtoken? (dissoc token :network :address) token)]
    {:eid eid :token token}))

(defn get-account [{:keys [accountId groupId index g nickname selected fuzzy]}]
  (let [g (and g {:account g})
        fuzzy (if (string? fuzzy)
                (re-pattern (str "(?i)" (.replaceAll (.trim fuzzy) " " ".*")))
                nil)
        post-process (if (seq g) identity #(get % :db/id))]
    (prst->js
     (cond
       accountId
       (when (q '[:find ?acc .
                  :in $ ?acc
                  :where [?acc :account/index]]
                accountId)
         (post-process (p (jsp->p g) accountId)))
       :else
       (let [query-initial (cond-> '{:find  [[?acc ...]]
                                     :in    [$]
                                     :where [[?acc :account/index _]]
                                     :args []}
                             (true? selected)
                             (-> (update :where conj '[?acc :account/selected true]))
                             (false? selected)
                             (-> (update :where conj (not '[?acc :account/selected true])))
                             fuzzy
                             (-> (update :args conj fuzzy)
                                 (update :in conj '?fuzzy)
                                 (update :where conj
                                         '[?acc :account/nickname ?acc-name]
                                         '[(re-find ?fuzzy ?acc-name)]))
                             groupId
                             (-> (update :args conj groupId)
                                 (update :in conj '?gid)
                                 (update :where conj '[?gid :accountGroup/account ?acc]))
                             nickname
                             (-> (update :args conj nickname)
                                 (update :in conj '?nick)
                                 (update :where conj '[?acc :account/nickname ?nick]))
                             index
                             (-> (update :args conj index)
                                 (update :in conj '?idx)
                                 (update :where conj '[?acc :account/index ?idx]))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             accs          (apply q query (:args query-initial))]
         (map post-process (if (seq accs) (pm (jsp->p g) accs) [])))))))

(defn get-token [{:keys [addressId networkId address tokenId g fuzzy]}]
  (let [g            (and g {:token g})
        post-process (if (seq g) identity #(get % :db/id))
        addr         (and (string? address) (.toLowerCase address))
        fuzzy-length (if (string? fuzzy) (count (.trim fuzzy)) nil)
        fuzzy-has-match-any (if (string? fuzzy) (.includes fuzzy ".*") nil)
        fuzzy        (if (string? fuzzy)
                       (try (re-pattern (str "(?i)" (.replaceAll (.trim fuzzy) " " ".*")))
                            (catch js/Error _ "_"))
                       nil)]
    (prst->js
     (cond
       tokenId
       (when (q '[:find ?token .
                  :in $ ?token
                  :where [?token :token/address]]
                tokenId)
         (post-process (p (jsp->p g) tokenId)))
       (and networkId addr)
       (post-process (p (jsp->p g) [:token/id [networkId addr]]))
       :else
       (let [query-initial (cond-> '{:find  [[?token ...]]
                                     :in    [$]
                                     :where [[?token :token/id _]]
                                     :args []}
                             networkId
                             (-> (update :args conj (if (vector? networkId) networkId [networkId]))
                                 (update :in conj '[?net ...])
                                 (update :where conj '[?token :token/network ?net]))
                             addr
                             (-> (update :args conj (if (vector? addr) addr [addr]))
                                 (update :in conj '[?tokenv ...])
                                 (update :where conj '[?token :token/address ?tokenv]))
                             addressId
                             (-> (update :args conj (if (vector? addressId) addressId [addressId]))
                                 (update :in conj '[?addr-id ...])
                                 (update :where conj '[?addr-id :address/token ?token]))
                             (and fuzzy (or (> fuzzy-length 3) fuzzy-has-match-any))
                             (-> (update :args conj fuzzy)
                                 (update :in conj '?fuzzy)
                                 (update :where conj
                                         '[?token :token/name ?tname]
                                         '[?token :token/symbol ?tsym]
                                         '[?token :token/address ?taddr]
                                         '(or [(re-find ?fuzzy ?tname)]
                                              [(re-find ?fuzzy ?tsym)]
                                              [(re-find ?fuzzy ?taddr)])))
                             (and fuzzy (not (or (> fuzzy-length 3) fuzzy-has-match-any)))
                             (-> (update :args conj fuzzy)
                                 (update :in conj '?fuzzy)
                                 (update :where conj
                                         '[?token :token/name ?tname]
                                         '[?token :token/symbol ?tsym]
                                         '(or [(re-find ?fuzzy ?tname)]
                                              [(re-find ?fuzzy ?tsym)])))

                             true identity)
             query (concat [:find] (:find query-initial)
                           [:in] (:in query-initial)
                           [:where] (:where query-initial))
             rst   (apply q query (:args query-initial))]
         (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))))))

(defn get-group [{:keys [groupId vaultId g nickname types hidden devices]}]
  (let [g            (and g {:accountGroup g})
        post-process (if (seq g) identity #(get % :db/id))]
    (prst->js
     (cond
       groupId
       (when (q '[:find ?g .
                  :in $ ?g
                  :where [?g :accountGroup/nickname]]
                groupId)
         (post-process (p (jsp->p g) groupId)))
       :else
       (let [query-initial (cond-> '{:find  [[?g ...]]
                                     :in    [$]
                                     :where [[?g :accountGroup/vault _]]
                                     :args []}
                             nickname
                             (-> (update :args conj nickname)
                                 (update :in conj '?nick)
                                 (update :where conj '[?g :accountGroup/nickname ?nick]))
                             hidden
                             (-> (update :args conj hidden)
                                 (update :in conj '?hidden)
                                 (update :where conj '[?g :accountGroup/hidden ?hidden]))
                             (not (nil? hidden))
                             (-> (update :where conj '(or (not [?g :accountGroup/hidden])
                                                          [?g :accountGroup/hidden false])))
                             vaultId
                             (-> (update :args conj vaultId)
                                 (update :in conj '?vault)
                                 (update :where conj '[?g :accountGroup/vault ?vault]))
                             (and types (not vaultId))
                             (-> (update :args conj types)
                                 (update :in conj '[?vtypes ...])
                                 (update :where conj '[?g :accountGroup/vault ?vault] '[?vault :vault/type ?vtypes]))
                             (and devices (not vaultId))
                             (-> (update :args conj devices)
                                 (update :in conj '[?vdevices ...])
                                 (update :where conj '[?g :accountGroup/vault ?vault] '[?vault :vault/device ?vdevices]))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             rst           (apply q query (:args query-initial))]
         (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))))))

(defn upsert-token-list [{:keys [newList networkId]}]
  (let [chainId                         (js/parseInt (:network/chainId (p '[:network/chainId] networkId)) 16)
        [token-ids token-map addresses] (reduce (fn [[coll m addresses] {:keys [address] :as x}]
                                                  (let [address (and (string? address) (.toLowerCase address))
                                                        x       (assoc x :address address)]
                                                    ;; only support tokens with current chainid
                                                    (if (not= (js/parseInt (:chainId x) 10) chainId)
                                                      [coll m addresses]
                                                      (let [x (map->nsmap x :token)]
                                                        [(conj coll [[networkId address] (assoc x :token/network networkId :token/fromList true)])
                                                         (assoc m address (dissoc x :token/address))
                                                         (conj addresses (:token/address x))]))))
                                                [[] {} #{}] newList)
        tokens-might-remove             (q '[:find [(pull ?t [:db/id :token/address]) ...]
                                             :in $ ?net
                                             :where
                                             [?t :token/network ?net]
                                             (not [?t :token/fromUser true])
                                             (not [?t :token/fromApp true])
                                             [?t :token/fromList true]
                                             [?any-addr :address/network ?net]
                                             (not [?any-addr :address/token ?t])] networkId)
        tokens-might-remove             (reduce (fn [acc token]
                                                  (if (some #{(:token/address token)} addresses)
                                                    acc
                                                    (conj acc (:db/id token))))
                                                [] tokens-might-remove)

        txs (q '[:find [?t ...]
                 :in $ [[?tid ?token] ...]
                 :where
                 (or [?t :token/id ?tid]
                     (and
                      (not [?t :token/id ?tid])
                      [(and true ?token) ?t]))]
               token-ids)
        txs (map-indexed
             (fn [idx x]
               (if (int? x)
                 (let [addr (:token/address (p '[:token/address] x))]
                   (-> (get token-map addr {})
                       (assoc :token/id [networkId addr])))
                 (assoc x :db/id (- (- idx) 10000)))) txs)
        txs (reduce (fn [acc tid] (conj acc [:db.fn/retractEntity tid])) txs tokens-might-remove)]
    (t txs)))

(defn validate-addr-in-app [{:keys [appId networkId addr]}]
  (q '[:find ?a .
       :in $ ?id ?app
       :where
       [?a :address/id ?id]
       ;; TODO: auth multiple account
       [?app :app/currentAccount ?acc]
       [?acc :account/address ?a]]
     [networkId (and (string? addr) (.toLowerCase addr))] appId))

(defn get-group-first-account-id [{:keys [groupId]}]
  (q '[:find ?a .
       :in $ ?g
       :where [?g :accountGroup/account ?a]]
     groupId))

(defn filter-account-group-by-network-type
  [network-type]
  (map #(e :accountGroup %)
       (if (= network-type "eth")
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
        acc-unselect         (if selected-account [[:db.fn/retractAttribute selected-account :account/selected]] [])
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
  [nextnet]
  (let [selected-net  (q '[:find ?net .
                           :where
                           [?net :network/selected true]])
        ;; unselect selected net
        net-unselect  [[:db.fn/retractAttribute selected-net :network/selected]]
        ;; select unselected net
        net-select    [[:db/add nextnet :network/selected true]]
        txns          (concat net-unselect net-select)]
    (t txns)
    true))

(defn get-apps-with-different-selected-network
  "given the to-be-selected network, return all apps with different selected network"
  [nextnet]
  (let [apps (q '[:find [?app ...]
                  :in $ ?net
                  :where
                  [?app :app/site]
                  (not [?app :app/currentNetwork ?net])]
                nextnet)]
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
                   [?addr :address/network ?net]
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
                         [?addr :address/network ?net]]
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
       [?addr :address/network ?net]]))

(defn get-current-network []
  (q '[:find ?net .
       :where
       [?net :network/selected true]]))

(defn get-apps [{:keys [appId siteId ;; currentAddresses currentAddressIds
                        accountIds currentAccountIds ;; addresses addressIds
                        g]}]
  (let [g            (and g {:app g})
        post-process (if (seq g) identity #(get % :db/id))
        ;; currentAddresses (if (seq currentAddresses) (mapv #(.toLowerCase %) currentAddresses) nil)
        ;; addresses (if (seq addresses) (mapv #(.toLowerCase %) addresses) nil)
        ]
    (prst->js
     (cond
       appId
       (when (q '[:find ?app .
                  :in $ ?app
                  :where [?app :app/site]])
         (post-process (p (jsp->p g) appId)))
       siteId
       (post-process (p (jsp->p g) (q '[:find ?app .
                                        :in $ ?site
                                        :where
                                        [?app :app/site ?site]]
                                      siteId)))
       :else
       (let [query-initial (cond-> '{:find  [[?app ...]]
                                     :in    [$]
                                     :where [[?app :app/site _]]
                                     :args []}
                             accountIds
                             (-> (update :args accountIds)
                                 (update :in conj '[?acc ...])
                                 (update :where conj '[?app :app/account ?acc]))
                             currentAccountIds
                             (-> (update :args currentAccountIds)
                                 (update :in conj '[?acc ...])
                                 (update :where conj '[?app :app/currentAccount ?acc]))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             rst           (apply q query (:args query-initial))]
         (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))))))

(defn get-address [{:keys [addressId networkId hex value accountId groupId index tokenId appId selected g]}]
  (let [g            (and g {:address g})
        post-process (if (seq g) identity #(get % :db/id))
        addr         (if (string? value) [value] value)
        addr         (if (vector? addr) (map #(.toLowerCase %) addr) addr)
        hex          (if (string? hex) [hex] hex)
        hex          (if (vector? hex) (map #(.toLowerCase %) hex) hex)
        addressId    (if selected (get-current-addr) addressId)]
    (prst->js
     (cond
       (vector? addressId)
       (pm (jsp->p g) addressId)
       addressId
       (when (q '[:find ?addr .
                  :in $ ?addr
                  :where [?addr :address/id]]
                addressId)
         (post-process (p (jsp->p g) addressId)))
       selected
       nil
       (and networkId (= (count addr) 1))
       (post-process (p (jsp->p g) [:address/id [networkId (first addr)]]))
       :else
       (let [query-initial (cond-> '{:find  [[?addr ...]]
                                     :in    [$]
                                     :where [[?addr :address/id _]]
                                     :args []}
                             networkId
                             (-> (update :args conj (if (vector? networkId) networkId [networkId]))
                                 (update :in conj '[?net ...])
                                 (update :where conj '[?addr :address/network ?net]))
                             addr
                             (-> (update :args conj addr)
                                 (update :in conj '[?addrv ...])
                                 (update :where conj '[?addr :address/value ?addrv]))
                             hex
                             (-> (update :args conj hex)
                                 (update :in conj '[?hex ...])
                                 (update :where conj '[?addr :address/hex ?hex]))
                             groupId
                             (-> (update :args conj (if (vector? groupId) groupId [groupId]))
                                 (update :in conj '[?gid ...])
                                 (update :where conj '[?gid :accountGroup/account ?acc] '[?acc :account/address ?addr]))
                             accountId
                             (-> (update :args conj (if (vector? accountId) accountId [accountId]))
                                 (update :in conj '[?acc ...])
                                 (update :where conj '[?acc :account/address ?addr]))
                             appId
                             (-> (update :args conj (if (vector? appId) appId [appId]))
                                 (update :in conj '[?appId ...])
                                 ;; TODO: v2, dapp auth to multiple accounts/networks
                                 (update :where conj
                                         '[?appId :app/currentAccount ?appacc]
                                         '[?appacc :account/address ?addr]
                                         '[?appId :app/currentNetwork ?appnet]
                                         '[?addr :address/network ?appnet]))
                             tokenId
                             (-> (update :args conj (if (vector? tokenId) tokenId [tokenId]))
                                 (update :in conj '[?token ...])
                                 (update :where conj '[?addr :address/token ?token]))
                             index
                             (-> (update :args conj (if (vector? index) index [index]))
                                 (update :in conj '[?idx ...])
                                 (update :where conj '[?addr :address/index ?idx]))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             rst           (apply q query (:args query-initial))]
         (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))))))

(defn get-balance [{:keys [addressId tokenId userAddress tokenAddress networkId g]}]
  (let [g (and g {:balance g})
        post-process (if (seq g) identity #(get % :db/id))
        userAddress (and (string? userAddress) (.toLowerCase userAddress))
        tokenAddress (and (string? tokenAddress) (.toLowerCase tokenAddress))
        networkId (if (and (or tokenAddress userAddress) (not networkId)) (get-current-network) networkId)
        userAddress (and userAddress (if (vector? userAddress) (map #(conj [networkId] %) userAddress) [networkId userAddress]))
        tokenAddress (and tokenAddress (if (vector? tokenAddress) (map #(conj [networkId] %) tokenAddress) [networkId tokenAddress]))]
    (prst->js
     (let [query-initial (cond-> '{:find  [[?balance ...]]
                                   :in    [$]
                                   :where [[?balance :balance/value _]]
                                   :args []}
                           addressId
                           (-> (update :args conj (if (vector? addressId) addressId [addressId]))
                               (update :in conj '[?addr-id ...])
                               (update :where conj '[?addr-id :address/balance ?balance]))
                           tokenId
                           (-> (update :args conj (if (vector? tokenId) tokenId [tokenId]))
                               (update :in conj '[?token-id ...])
                               (update :where conj '[?token-id :token/balance ?balance]))
                           userAddress
                           (-> (update :args conj userAddress)
                               (update :in conj '[?uaddrid ...])
                               (update :where conj
                                       '[?addr-id :address/id ?uaddrid]
                                       '[?addr-id :address/balance ?balance]))
                           tokenAddress
                           (-> (update :args conj tokenAddress)
                               (update :in conj '[?taddrid ...])
                               (update :where conj
                                       '[?token-id :token/id ?taddrid]
                                       '[?token-id :token/balance ?balance]))
                           true identity)
           query         (concat [:find] (:find query-initial)
                                 [:in] (:in query-initial)
                                 [:where] (:where query-initial))
           rst           (apply q query (:args query-initial))]
       (map post-process (if (seq rst) (pm (jsp->p g) rst) []))))))

(defn get-network [{:keys [addressId networkId tokenId selected type g]}]
  (let [g (and g {:network g})
        post-process (if (seq g) identity #(get % :db/id))]
    (prst->js
     (cond
       networkId
       (when (q '[:find ?net .
                  :in $ ?net
                  :where [?net :network/name]]
                networkId)
         (post-process (p (jsp->p g) networkId)))
       :else
       (let [query-initial (cond-> '{:find  [[?net ...]]
                                     :in    [$]
                                     :where [[?net :network/name _]]
                                     :args []}
                             addressId
                             (-> (update :args conj (if (vector? addressId) addressId [addressId]))
                                 (update :in conj '[?addr ...])
                                 (update :where conj '[?addr :address/network ?net]))
                             tokenId
                             (-> (update :args conj (if (vector? tokenId) tokenId [tokenId]))
                                 (update :in conj '[?token ...])
                                 (update :where conj '[?token :token/network ?net]))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             rst           (apply q query (:args query-initial))]
         (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))))))

(defn- cleanup-token-list-after-delete-address []
  (let [tokens (q '[:find [?t ...]
                    :where
                    [?t :token/fromUser true]
                    (not [?addr :address/token ?t])
                    (or [?t :token/fromApp false]
                        (not [?t :token/fromApp]))
                    (or [?t :token/fromList false]
                        (not [?t :token/fromList]))])
        txs (map (fn [eid] [:db.fn/retractEntity eid]) tokens)]
    (t txs)))

(defn retract-group [{:keys [groupId]}]
  (t [[:db.fn/retractEntity groupId]])
  (cleanup-token-list-after-delete-address)
  true)

(defn retract-network [{:keys [networkId]}]
  (let [addrs  (q '[:find [?addr ...]
                    :in $ ?net
                    :where [?addr :address/network ?net]]
                  networkId)
        tokens (q '[:find [?token ...]
                    :in $ ?net
                    :where [?token :token/network ?net]]
                  networkId)
        txs (map (fn [eid] [:db.fn/retractEntity eid]) addrs)
        txs (into txs (map (fn [eid] [:db.fn/retractEntity eid]) tokens))
        txs (conj txs [:db.fn/retractEntity networkId])]
    (t txs)
    (cleanup-token-list-after-delete-address)
    true))

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
        address        (and (string? address) (.toLowerCase address))
        networkId      network
        token-exist?   (q '[:find ?t .
                            :in $ ?tid
                            :where
                            [?t :token/id ?tid]]
                          [networkId address])
        token-id       (or token-exist? -1)
        address        (and (string? address) (.toLowerCase address))
        add-token-tx   (when-not token-exist?
                         {:db/id          token-id
                          :token/name     name
                          :token/symbol   symbol
                          :token/decimals decimals
                          :token/logoURI  image
                          :token/network  networkId
                          :token/address  address
                          :token/fromUser (boolean fromUser)
                          :token/fromApp  (boolean fromApp)
                          :token/fromList (boolean fromList)})
        token-in-addr? (and token-exist?
                            (q '[:find ?t .
                                 :in $ ?taddr ?addr
                                 :where
                                 [?t :token/address ?taddr]
                                 [?addr :address/token ?t]]
                               address addressId))
        tx             (if token-exist? [] [add-token-tx])
        tx             (if token-in-addr? tx (conj tx {:db/id addressId :address/token token-id}
                                                   {:db/id "new-balance" :balance/value "0x0"}
                                                   {:db/id addressId :address/balance "new-balance"}
                                                   {:db/id token-id :token/balance "new-balance"}))
        tx-rst         (and (not checkOnly) (t tx))
        token-id       (if (and (not checkOnly) (= token-id -1)) (get-in tx-rst [:tempids -1]) token-id)]
    {:tokenId       token-id
     :alreadyInNet  (boolean token-exist?)
     :alreadyInAddr (boolean token-in-addr?)}))

(defn token-in-addr? [{:keys [addressId tokenId]}]
  (-> (q '[:find ?x .
           :in $ ?addr ?token
           :where
           [?addr :address/token ?token]
           [(and true true) ?x]]
         addressId tokenId)
      boolean))

(defn addr-network-id-to-addr-id [addr netId]
  (q '[:find ?addr-id .
       :in $ ?addr ?net
       :where
       [?addr-id :address/value ?addr]
       [?addr-id :address/network ?net]]
     (and (string? addr) (.toLowerCase addr)) netId))
(defn addr-network-id-to-token-id [addr netId]
  (q '[:find ?token-id .
       :in $ ?addr ?net
       :where
       [?token-id :token/address ?addr]
       [?token-id :token/network ?net]]
     addr netId))

(defn get-account-group-by-vault-type [type]
  (q '[:find [?g ...]
       :in $ ?type
       :where
       [?g :accountGroup/vault ?v]
       [?v :vault/type ?type]]
     type))

(defn get-single-call-balance-params [{:keys [type allNetwork networkId]}]
  (let [all?                 (= type "all")
        native-balance-binds (q '[:find ?net ?addr ?token
                                  :in $ ?allnet ?network
                                  :where
                                  (or
                                   (and
                                    [(true? ?allnet)]
                                    [?net :network/name _])
                                   (and
                                    [(not ?allnet)]
                                    [(and true ?network) ?net]))
                                  [?addr-id :address/network ?net]
                                  [?addr-id :address/value ?addr]
                                  [(and true "0x0") ?token]] allNetwork networkId)
        token-binds          (q '[:find ?net ?addr ?token
                                  :in $ ?allnet ?alladdr ?network
                                  :where
                                  (or
                                   (and [(true? ?allnet)]
                                        [?net :network/name _])
                                   (and
                                    [(not ?allnet)]
                                    [(and true ?network) ?net]))
                                  [?addr-id :address/network ?net]
                                  [?acc :account/address ?addr-id]
                                  (or
                                   [(true? ?alladdr)]
                                   (and
                                    [(not ?alladdr)]
                                    [?acc :account/selected true]))
                                  [?token-id :token/network ?net]
                                  [?token-id :token/address ?token]
                                  [?addr-id :address/value ?addr]]
                                allNetwork all? networkId)
        format-balance-binds (fn [acc [network-id uaddr taddr]]
                               (let [[u t net] (get acc network-id [#{} #{} (e :network network-id)])]
                                 (assoc acc network-id [(conj u uaddr) (conj t taddr) net])))
        params               (reduce format-balance-binds {} native-balance-binds)
        params               (reduce format-balance-binds params token-binds)]
    (into [] params)))

(defn upsert-balances [{:keys [networkId data]}]
  (let [txs
        (reduce
         (fn [acc [uaddr d]]
           (let [uaddr (name uaddr)]
             (reduce
              (fn [acc [taddr balance]]
                (let [taddr (name taddr)]
                  (if (= taddr "0x0")
                    (conj acc {:db/id                 [:address/id [networkId uaddr]]
                               :address/nativeBalance balance})
                    (let [balance-eid (q '[:find ?b .
                                           :in $ ?uaddr ?taddr
                                           :where
                                           [?u :address/id ?uaddr]
                                           [?t :token/id ?taddr]
                                           [?u :address/balance ?b]
                                           [?t :token/balance ?b]]
                                         [networkId uaddr] [networkId taddr])
                          gt0?        (.gt (bn/BigNumber.from balance) 0)]
                      (if (and (not gt0?) (not balance-eid))
                        acc
                        (let [tmp-balance-id (str networkId uaddr taddr)
                              acc            (conj acc {:db/id         (or
                                                                        balance-eid
                                                                        tmp-balance-id)
                                                        :balance/value balance}
                                                   {:db/id         [:address/id [networkId uaddr]]
                                                    :address/token [:token/id [networkId taddr]]})
                              acc            (if balance-eid acc
                                                 (conj acc {:db/id           [:address/id [networkId uaddr]]
                                                            :address/balance (str networkId uaddr taddr)}
                                                       {:db/id         [:token/id [networkId taddr]]
                                                        :token/balance (str networkId uaddr taddr)}))]
                          acc))))))
              acc d)))
         []
         data)]
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

(defn get-addr-tx-by-hash [{:keys [addressId txhash]}]
  (->> (q '[:find ?tx .
            :in $ ?addr ?hash
            :where
            [?tx :tx/hash ?hash]
            [?addr :address/tx ?tx]]
          addressId txhash)
       (e :tx)))

(defn get-unfinished-tx-raw
  "Get tx that is not failed or confirmed"
  []
  (q '[:find ?tx ?addr ?net
       :where
       [?tx :tx/status ?status]
       [(>= ?status 0)]
       [(< ?status 5)]
       [?addr :address/tx ?tx]
       [?addr :address/network ?net]]))

(defn get-unfinished-tx []
  (->> (get-unfinished-tx-raw)
       (mapv (fn [[tx-id addr-id net-id]]
               ;; {:tx      (e :tx tx-id)
               ;;  :address (e :address addr-id)}
               {:tx      tx-id
                :network (e :network net-id)
                :address (e :address addr-id)}))))

(defn get-unfinished-tx-count
  "Get count of txs that is not failed or confirmed"
  []
  (->> (get-unfinished-tx-raw)
       count))

(defn get-pending-auth-req []
  (->> (q '[:find [?a ...]
            :where
            (or [?a :authReq/app _]
                [?a :authReq/site _])
            ;; (not [?a :authReq/processed true])
            ])
       (mapv #(e :authReq %))))

(defn set-tx-skipped [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status -2}]))
(defn set-tx-failed [{:keys [hash error]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status -1 :tx/err error}]))
(defn set-tx-unsent [{:keys [hash resendAt]}]
  (let [tx {:db/id [:tx/hash hash] :tx/status 0}
        tx (if resendAt (assoc tx :tx/resendAt resendAt) tx)]
    (t [tx])))
(defn set-tx-sending [{:keys [hash]}]
  (t [{:db/id [:tx/hash hash] :tx/status 1}]))
(defn set-tx-pending [{:keys [hash]}]
  (t [;; [:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 2}]))
(defn set-tx-packaged [{:keys [hash blockHash]}]
  (t [;; [:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 3 :tx/blockHash blockHash}]))
(defn set-tx-executed [{:keys [hash receipt]}]
  (t [;; [:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 4 :tx/receipt receipt}]))
(defn set-tx-confirmed [{:keys [hash]}]
  (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
      {:db/id [:tx/hash hash] :tx/status 5}]))
(defn set-tx-chain-switched [{:keys [hash]}]
  (t [{:db/id [:tx/hash hash] :tx/chainSwitched true}]))

(defn get-txs-to-enrich
  ([] (get-txs-to-enrich {}))
  ([{:keys [txhash type]}]
   (let [txs (q '[:find ?tx ?addr ?net ?token ?app
                  :in $ ?txhash ?nettype
                  :where
                  (or (and [(and true ?txhash)]
                           [?tx :tx/hash ?txhash])
                      (and [(not ?txhash)]
                           [?tx :tx/hash]))

                  [?tx :tx/txExtra ?extra]
                  [?extra :txExtra/ok ?txextra-ok]
                  [(not ?txextra-ok)]
                  [?tx :tx/txPayload ?payload]
                  [(get-else $ ?payload :txPayload/to false) ?to]

                  [?addr :address/tx ?tx]
                  [?addr :address/network ?net]
                  (or [(= ?nettype "all")]
                      [?net :network/type ?nettype])

                  (or
                   [?token :token/tx ?tx]
                   (and [?token :token/address ?to]
                        [?token :token/network ?net])
                   [(and true false) ?token])
                  (or
                   [?app :app/tx ?tx]
                   [(and true false) ?app])]
                txhash (or type "all"))
         process (if txhash (fn [[tx addr net token app]]
                              {:tx      (e :tx tx)
                               :address (e :address addr)
                               :network (e :network net)
                               :token   (and token (e :token token))
                               :app     (and token (e :app app))})
                     (fn [[tx addr net token app]]
                       {:tx      (e :tx tx)
                        :address addr
                        :network net
                        :token   token
                        :app     app}))
         rst     (mapv process txs)
         rst     (if txhash (first rst) rst)]
     rst)))

(defn cleanup-tx []
  (let [tx (q '[:find [?tx ...]
                :where [?tx :tx/hash]])
        to-del-count (- (count tx) 1000)]
    (if (> to-del-count 0)
      (do (->> (sort tx)
               (take to-del-count)
               (mapv (fn [id] [:db.fn/retractEntity id]))
               t)
          true)
      false)))

;;; UI QUERIES
(defn account-list-assets [{:keys [accountGroupTypes]}]
  (let [accountGroupTypes (if (vector? accountGroupTypes) accountGroupTypes ["hd" "pk" "hw" "pub"])
        cur-addr (e :address (get-current-addr))
        cur-net  (e :network (get-current-network))
        data     (q '[:find ?group ?acc ?addr
                      :in $ ?cur-net [?accountGroupTypes ...]
                      :where
                      [?vault :vault/type ?accountGroupTypes]
                      [?group :accountGroup/vault ?vault]
                      [?group :accountGroup/account ?acc]
                      [?acc :account/address ?addr]
                      [?addr :address/network ?cur-net]]
                    (:db/id cur-net) accountGroupTypes)
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

(defn- sort-tx [[noncea txa _] [nonceb txb _]]

  (cond
    ;; sort by nonce
    (.gt (bn/BigNumber.from noncea)
         (bn/BigNumber.from nonceb))
    true
    ;; sort by created order when with same nonce
    (.eq (bn/BigNumber.from noncea)
         (bn/BigNumber.from nonceb))
    (> txa txb)
    :else
    false))

(defn query-tx-list [{:keys [offset limit addressId tokenId appId extraType status countOnly]}]
  (let [offset    (or offset 0)
        limit     (min 100 (or limit 10))
        [status> status>= status< status<=]
        (if (map? status) [(:gt status)
                           (:gte status)
                           (:lt status)
                           (:lte status)]
            (repeat 4 nil))
        extraType (if extraType (keyword "txExtra" extraType) extraType)
        query-initial
        (cond-> '{:find  [?nonce ?tx (pull ?tx [:app/_tx [:db/id]]) (pull ?tx [:token/_tx [:db/id]])]
                  :in    [$]
                  :where [[?tx :tx/txPayload ?payload]
                          [?payload :txPayload/nonce ?nonce]]
                  :args []}
          addressId
          (-> (update :args conj addressId)
              (update :in conj '?addr)
              (update :where conj '[?addr :address/tx ?tx]))
          tokenId
          (-> (update :args conj tokenId)
              (update :in conj '?target-token)
              (update :where conj '[?target-token :token/tx ?tx]))
          appId
          (-> (update :args conj appId)
              (update :in conj '?target-app)
              (update :where conj '[?target-app :app/tx ?tx]))
          extraType
          (-> (update :args conj extraType)
              (update :in conj '?extraType)
              (update :where into '[[?tx :tx/txExtra ?extra]
                                    [?extra ?extraType true]]))
          (int? status)
          (-> (update :args conj status)
              (update :in conj '?target-status)
              (update :where into '[[?tx :tx/status ?status]
                                    [(= ?status ?target-status)]]))
          (vector? status)
          (-> (update :args conj status)
              (update :in conj '[?target-status])
              (update :where into '[[?tx :tx/status ?status]
                                    [(= ?status ?target-status)]]))
          status>
          (-> (update :args conj status>)
              (update :in conj '?status>)
              (update :where into '[[?tx :tx/status ?status]
                                    [(> ?status ?status>)]]))
          status>=
          (-> (update :args conj status>=)
              (update :in conj '?status>=)
              (update :where into '[[?tx :tx/status ?status]
                                    [(>= ?status ?status>=)]]))
          status<
          (-> (update :args conj status<)
              (update :in conj '?status<)
              (update :where into '[[?tx :tx/status ?status]
                                    [(< ?status ?status<)]]))
          status<=
          (-> (update :args conj status<=)
              (update :in conj '?status<=)
              (update :where into '[[?tx :tx/status ?status]
                                    [(<= ?status ?status<=)]]))
          true identity)
        query     (concat [:find] (:find query-initial)
                          [:in] (:in query-initial)
                          [:where] (:where query-initial))

        txs   (->> (apply q query (:args query-initial))
                   (sort sort-tx)
                   (map rest))
        total (count txs)
        txs   (when-not countOnly (->> txs
                                       (drop offset)
                                       (take limit)))]
    (if countOnly total
        {:total total
         :data  (mapv (fn [[tx app token]]
                        (let [app (-> app :app/_tx first :db/id)
                              token (-> token :token/_tx first :db/id)]
                          (-> (.toMap (e :tx tx))
                              (assoc :app (and app (e :app app)))
                              (assoc :token (and token (e :token token))))))
                      txs)})))

(defonce default-preferences {:hideTestNetwork false
                              :useModernProviderAPI false})

(defn get-preferences []
  (let [preferences (or (:preferences
                         (q '[:find (pull ?p [:preferences]) .
                              :where
                              [?p :preferences]]))
                        default-preferences)
        preferences (deep-merge default-preferences preferences)]
    preferences))

(defn set-preferences [preferences]
  (let [preferences (deep-merge default-preferences (or preferences {}))
        pref-id     (or (q '[:find ?p .
                             :where [?p :preferences]])
                        -1)
        txs         [{:db/id pref-id :preferences preferences}]]
    (t txs)
    true))

(def queries {:batchTx
              (fn [txs]
                (let [txs (-> txs js/window.JSON.parse j->c)
                      txs (map (fn [[e a v]] [:db/add e (keyword a) v]) txs)
                      rst (t txs)]
                  (clj->js rst)))

              :getPendingAuthReq                   get-pending-auth-req
              :newAddressTx                        new-address-tx
              :newtokenTx                          new-token-tx
              :getGroupFirstAccountId              get-group-first-account-id
              :filterAccountGroupByNetworkType     filter-account-group-by-network-type
              :getExportAllData                    get-export-all-data
              :setCurrentAccount                   set-current-account
              :setCurrentNetwork                   set-current-network
              :upsertAppPermissions                upsert-app-permissions
              :accountAddrByNetwork                account-addr-by-network
              :retract                             retract
              :retractAttr                         retract-attr
              :getCurrentAddr                      #(e :address (get-current-addr))
              :addTokenToAddr                      add-token-to-addr
              :getSingleCallBalanceParams          get-single-call-balance-params
              :upsertBalances                      upsert-balances
              :retractAddressToken                 retract-address-token
              :getAddrTxByHash                     get-addr-tx-by-hash
              :isTokenInAddr                       token-in-addr?
              :getUnfinishedTx                     get-unfinished-tx
              :getUnfinishedTxCount                get-unfinished-tx-count
              :setTxSkipped                        set-tx-skipped
              :setTxFailed                         set-tx-failed
              :setTxSending                        set-tx-sending
              :setTxPending                        set-tx-pending
              :setTxPackaged                       set-tx-packaged
              :setTxExecuted                       set-tx-executed
              :setTxConfirmed                      set-tx-confirmed
              :setTxChainSwitched                  set-tx-chain-switched
              :setTxUnsent                         set-tx-unsent
              :getTxsToEnrich                      get-txs-to-enrich
              :cleanupTx                           cleanup-tx
              :findApp                             get-apps
              :findAddress                         get-address
              :findNetwork                         get-network
              :findAccount                         get-account
              :findToken                           get-token
              :findGroup                           get-group
              :validateAddrInApp                   validate-addr-in-app
              :upsertTokenList                     upsert-token-list
              :retractNetwork                      retract-network
              :retractGroup                        retract-group
              :setPreferences                      set-preferences
              :getPreferences                      get-preferences
              :getAppsWithDifferentSelectedNetwork get-apps-with-different-selected-network

              :queryqueryApp              get-apps
              :queryqueryAddress          get-address
              :queryqueryNetwork          get-network
              :queryqueryAccount          get-account
              :queryqueryToken            get-token
              :queryqueryGroup            get-group
              :queryqueryBalance          get-balance
              :querytxList                query-tx-list
              :queryaccountListAssets     account-list-assets
              :getAccountGroupByVaultType get-account-group-by-vault-type})

(defn apply-queries [rst conn qfn entity tfn ffn]
  (defn p [x eid]
    (db/pull @conn x eid))
  (defn pm [x eids]
    (db/pull-many @conn x eids))
  (def q qfn)
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
   rst
   queries))

(comment
  (tap> (->> (q '[:find [?tx ...]
                  :where
                  [?tx :tx/txPayload _]])
             first
             (e :tx)
             .toMap)))
