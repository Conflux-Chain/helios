(ns cfxjs.db.queries
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.schema :refer [model->attr-keys]]))

(declare q e t fdb)

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

(defn account-addr-by-network
  [{:keys [account network]}]
  (->> (q '[:find [?addr ...]
            :in $ ?acc ?net
            :where
            [?acc :account/address ?addr]
            [?net :network/address ?addr]]
          account network)
       first
       (e :address)))

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
              :retractAttr                     retract-attr})

(defn apply-queries [conn qfn entity tfn ffn]
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
   conn
   queries))
