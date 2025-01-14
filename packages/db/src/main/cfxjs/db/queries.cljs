(ns cfxjs.db.queries
  (:require
   ["@ethersproject/bignumber" :as bn]
   [better-cond.core :as bc :refer [defnc]]
   [cfxjs.db.datascript.core :as db]
   [cfxjs.db.schema :refer [model->attr-keys]]
   [cfxjs.spec.cljs]
   [clojure.walk :refer [postwalk walk]]
   [goog.string :as gstr]
   [medley.core :refer [deep-merge]]
   [taoensso.encore :as enc]))

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

(defn new-address-tx
  "Generate a tx to create address,
  replace eid with eid or found addr dbid if eid is tmpid
  value, network is required"
  [{:keys [value network eid hex] :as addr}]
  (let [value    (and (string? value) (.toLowerCase value))
        hex      (and (string? value) (.toLowerCase hex))
        addr     (enc/assoc-when addr :hex hex)
        addr     (enc/assoc-when addr :value value)
        eid      (if (pos-int? eid)
                   eid
                   (or
                    (try (:db/id (p [:db/id] [:address/id [network value]]))
                         (catch js/Error _ eid))
                    eid))
        oldaddr? (pos-int? eid)
        addr     (dissoc addr :eid)
        addr     (if oldaddr? (dissoc addr :network :value) addr)]
    {:eid eid :address addr}))

(defn new-token-tx [{:keys [address network eid] :as token}]
  (let [address   (and (string? address) (.toLowerCase address))
        eid       (if (pos-int? eid)
                    eid
                    (or (try (:db/id (p [:db/id] [:token/id [network address]]))
                             (catch js/Error _ eid))
                        eid))
        oldtoken? (pos-int? eid)
        token     (dissoc token :eid)
        token     (if oldtoken? (dissoc token :network :address) token)]
    {:eid eid :token token}))

(defn get-account-group [{:keys [groupId g fuzzy selected groupTypes]}]
  (let [g            (and g {:accountGroup g})
        fuzzy        (if (string? fuzzy)
                       (.trim fuzzy)
                       nil)
        fuzzy        (if (and fuzzy (not (= fuzzy "")))
                       (re-pattern
                        (str "(?i)"
                             (-> fuzzy
                                 gstr/regExpEscape
                                 (.replaceAll " " ".*"))))
                       nil)
        post-process (if (seq g) identity #(get % :db/id))]
    (prst->js
     (cond
       groupId
       (when (q '[:find ?acc .
                  :in $ ?acc
                  :where [?acc :accountGroup/nickname]]
                groupId)
         (post-process (p (jsp->p g) groupId)))
       :else
       (let [query-initial (cond-> '{:find  [[?g ...]]
                                     :in    [$]
                                     :where [[?g :accountGroup/nickname]]
                                     :args []}
                             (true? selected)
                             (-> (update :where conj
                                         '[?g :accountGroup/account ?acc]
                                         '[?acc :account/selected true]))
                             (false? selected)
                             (-> (update :where conj
                                         '[?g :accountGroup/account ?acc]
                                         (not '[?acc :account/selected true])))
                             (seq groupTypes)
                             (-> (update :args conj groupTypes)
                                 (update :in conj '[?groupTypes ...])
                                 (update :where conj
                                         '[?g :accountGroup/vault ?vault]
                                         '[?vault :vault/type ?groupTypes]))
                             fuzzy
                             (-> (update :args conj fuzzy)
                                 (update :in conj '?fuzzy)
                                 (update :where conj
                                         '[?g :accountGroup/nickname ?g-name]
                                         '[?g :accountGroup/account ?acc]
                                         '[?acc :account/nickname ?acc-name]
                                         '(or
                                           [(re-find ?fuzzy ?g-name)]
                                           [(re-find ?fuzzy ?acc-name)])))
                             true identity)
             query         (concat [:find] (:find query-initial)
                                   [:in] (:in query-initial)
                                   [:where] (:where query-initial))
             accs          (apply q query (:args query-initial))]
         (map post-process (if (seq accs) (pm (jsp->p g) accs) [])))))))

(defn get-account-list [{:keys [fuzzy groupTypes includeHidden networkId groupG accountG addressG]}]
  (let [accountG      (and accountG {:account accountG})
        groupG        (and groupG {:accountGroup groupG})
        addressG      (and addressG {:address addressG})
        pull-group    #(if (seq groupG) (p (jsp->p groupG) %) {:eid %})
        pull-account  #(if (seq accountG) (p (jsp->p accountG) %) {:eid %})
        pull-address  #(if (seq addressG) (p (jsp->p addressG) %) {:eid %})
        postprocess-group-account-address
        (fn [data]
          (reduce-kv
           (fn [m groupId v]
             (let [v (map rest v)]
               (assoc m groupId
                      (assoc
                       (pull-group groupId)
                       :account
                       (reduce-kv
                        (fn [m accountId v]
                          (let [v (map #(-> % rest first pull-address) v)]
                            (assoc m accountId (assoc (pull-account accountId) (if networkId :currentAddress :address) (if networkId (first v) v)))))
                        {}
                        (group-by first v))))))
           {}
           (group-by first data)))
        fuzzy        (if (string? fuzzy)
                       (.trim fuzzy)
                       nil)
        fuzzy        (if (and fuzzy (not (= fuzzy "")))
                       (re-pattern
                        (str "(?i)"
                             (-> fuzzy
                                 gstr/regExpEscape
                                 (.replaceAll " " ".*"))))
                       nil)
        query-initial (cond-> '{:find  [?g ?acc ?addr]
                                :in    [$]
                                :where [[?g :accountGroup/nickname]
                                        [?g :accountGroup/account ?acc]
                                        [?acc :account/address ?addr]]
                                :args []}
                        (seq groupTypes)
                        (-> (update :args conj groupTypes)
                            (update :in conj '[?groupTypes ...])
                            (update :where conj
                                    '[?g :accountGroup/vault ?vault]
                                    '[?vault :vault/type ?groupTypes]))
                        fuzzy
                        (-> (update :args conj fuzzy)
                            (update :in conj '?fuzzy)
                            (update :where conj
                                    '[?g :accountGroup/nickname ?g-name]
                                    '[?g :accountGroup/account ?acc]
                                    '[?acc :account/nickname ?acc-name]
                                    '[?addr :address/value ?addrv]
                                    '(or
                                      [(re-find ?fuzzy ?g-name)]
                                      [(re-find ?fuzzy ?acc-name)]
                                      [(re-find ?fuzzy ?addrv)])))
                        (not (true? includeHidden))
                        (-> (update :where conj
                                    '(not [?acc :account/hidden true])))
                        networkId
                        (-> (update :args conj networkId)
                            (update :in conj '?net)
                            (update :where conj
                                    '[?addr :address/network ?net]))
                        true identity)
        query         (concat [:find] (:find query-initial)
                              [:in] (:in query-initial)
                              [:where] (:where query-initial))
        accs          (apply q query (:args query-initial))]
    (prst->js (postprocess-group-account-address accs))))

(defn get-account [{:keys [accountId groupId index g nickname selected fuzzy]}]
  (let [g            (and g {:account g})
        fuzzy        (if (string? fuzzy)
                       (.trim fuzzy)
                       nil)
        fuzzy        (if (and fuzzy (not (= fuzzy "")))
                       (re-pattern
                        (str "(?i)"
                             (-> fuzzy
                                 gstr/regExpEscape
                                 (.replaceAll " " ".*"))))
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
  (let [g                   (and g {:token g})
        post-process        (if (seq g) identity #(get % :db/id))
        addr                (and (string? address) (.toLowerCase address))
        fuzzy               (if (and (string? fuzzy) (not (-> fuzzy .trim (= ""))))
                              (.trim fuzzy)
                              nil)
        fuzzy-length        (if fuzzy (count fuzzy) nil)
        fuzzy               (if (and fuzzy (not (= fuzzy "")))
                              (re-pattern
                               (str "(?i)"
                                    (-> fuzzy
                                        gstr/regExpEscape
                                        (.replaceAll " " ".*"))))
                              nil)
        fuzzy-has-match-any (if fuzzy (.includes (str fuzzy) ".*") nil)]
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

(defn upsert-token-list
  "Given new tokenlist, remove uninteresting token,
  update exsiting token info (update based on [networkId token-addr] tuple),
  insert newly added tokens"
  [{:keys [newList networkId]}]
  (let [chainId                         (js/parseInt (:network/chainId (p '[:network/chainId] networkId)) 16)
        [token-ids token-map addresses] (reduce (fn [[coll m addresses] {:keys [address] :as token-list-item}]
                                                  (let [address         (and (string? address) (.toLowerCase address))
                                                        token-list-item (assoc token-list-item :address address)]
                                                    ;; only support tokens with current chainid
                                                    (if (not= (js/parseInt (:chainId token-list-item) 10) chainId)
                                                      [coll m addresses]
                                                      (let [token-list-item (map->nsmap token-list-item :token)]
                                                        [;; token-ids
                                                         (conj coll [[networkId address]
                                                                     (assoc token-list-item :token/network networkId :token/fromList true)])
                                                         ;; token-map
                                                         (assoc m address (dissoc token-list-item :token/address))
                                                         ;; addresses
                                                         (conj addresses (:token/address token-list-item))]))))
                                                [[] {} #{}] newList)
        ;; find tokens removed between tokenlist upgrade
        ;; tokens
        ;; 1. not from user/dapp
        ;; 2. not tracked by any address
        tokens-might-remove             (q '[:find [(pull ?t [:db/id :token/address]) ...]
                                             :in $ ?net
                                             :where
                                             [?t :token/network ?net]
                                             (not [?t :token/fromUser true])
                                             (not [?t :token/fromApp true])
                                             [?t :token/fromList true]
                                             [?any-addr :address/network ?net]
                                             (not [?any-addr :address/token ?t])] networkId)
        ;; 3. not in latest tokenlist
        tokens-might-remove             (reduce (fn [acc token]
                                                  (if (some #{(:token/address token)} addresses)
                                                    acc
                                                    (conj acc (:db/id token))))
                                                [] tokens-might-remove)

        ;; ?tid is [networkId address] tuple
        ;; ?token is newly added token in latest tokenlist
        tokens-to-upsert (q '[:find [?t ...]
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
                 (assoc x :db/id (- (- idx) 10000))))
             tokens-to-upsert)

        txs (reduce
             (fn [acc tid] (conj acc [:db.fn/retractEntity tid]))
             txs tokens-might-remove)]
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
         ;; 1. type "pub", cfxOnly true
         ;; 2. type hw cfxOnly true/false
         (q '[:find [?g ...]
              :where
              [?g :accountGroup/vault ?v]
              [?v :vault/type ?vtype]
              (not [?v :vault/cfxOnly true]
                   [?v :vault/type "pub"])
              (not [?v :vault/cfxOnly true]
                   [?v :vault/type "hw"])])

         (q '[:find [?g ...]
              :where
              [?g :accountGroup/vault ?v]
              [?v :vault/type ?vtype]
              (not (or [?v :vault/cfxOnly false]
                       [?v :vault/cfxOnly nil])
                   [?v :vault/type "hw"])]))))

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
    (map
     (fn [d] [(.-e d) (str (namespace (.-a d)) "/" (name (.-a d))) (.-v d)])
     datoms)))

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
                                  [?app :app/account ?acc]
                                  (not [?app :app/currentAccount ?acc])]
                                acc)
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

(defn get-connected-sites-without-apps
  "Get sites that not authed as an app but has the post method defined"
  []
  (->> (q '[:find [?site ...]
            :where
            [?site :site/post _]
            (not [?app :app/site ?site])])
       (map (partial e :site))))

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

(defn get-app-another-authed-none-hw-account [{:keys [appId]}]
  (q '[:find ?acc .
       :in $ ?app
       :where
       [?app :app/account ?acc]
       [?g :accountGroup/account ?acc]
       [?g :accountGroup/vault ?v]
       [?v :vault/type ?type]
       (not [(= ?type "hw")])]
     appId))

(defn get-hidden-account-apps
  "Given to-hide accountId, find apps which authed this account,
  return [txs sideeffects] to handle the hidden account"
  [{:keys [accountId]}]
  (let [apps-data
        (q '[:find ?app (distinct ?available-acc) ?current-acc
             :in $ ?acc
             :where
             [?app :app/account ?acc]
             [?app :app/currentAccount ?curacc]
             [(= ?curacc ?acc) ?current-acc]
             [?app :app/account ?available-acc]
             ;; make sure available acc has addr in current net
             [?available-acc :account/address ?addr]
             [?addr :address/network ?net]
             [?net :network/selected true]]
           accountId)

        ->txs
        ;; txs: transactions send to db
        ;; sideeffects: methods to call in js to notify app
        (fn [[txs sideeffects] [app-id available-acc-ids current-acc?]]
          (bc/cond
            :let
            [next-available-acc
             (some #(when (not= % accountId) %) available-acc-ids)]
            ;; hidden acc is the only available and current acc of app
            ;; delete the app
            (and current-acc? (nil? next-available-acc))
            [txs (conj sideeffects [:wallet_deleteApp {:appId app-id}])]

            ;; hidden acc is not current acc of dapp (more than 1 available acc)
            ;; unauth acc
            (not current-acc?)
            [(conj txs [:db/retract app-id :app/account accountId]) sideeffects]

            ;; hidden acc is current acc of app and app has multiple available acc
            ;; switch current acc, unauth acc
            :else
            [(conj txs [:db/retract app-id :app/account accountId])
             (conj sideeffects [:wallet_setAppCurrentAccount {:appId app-id :accountId next-available-acc}])]))]
    (reduce ->txs [[] []] apps-data)))

(defn update-account [{:keys [accountId nickname hidden offline]}]
  (let [acc               (p [:account/hidden ;; :account/selected
                              ]
                             accountId)
        newly-hidden?     (and hidden (not (:account/hidden acc)))
        ;; cur-acc?          (:account/selected acc)
        [txs sideeffects] (if newly-hidden? (get-hidden-account-apps {:accountId accountId}) [[] []])
        update-acc-tx     (-> {:db/id accountId}
                              (enc/assoc-some :account/nickname nickname)
                              (enc/assoc-some :account/hidden hidden)
                              (enc/assoc-some :account/offline offline))
        txs               (conj txs update-acc-tx)]
    (t txs)
    sideeffects))

(defn is-last-none-hw-account
  "Check if acc is last none hw acc"
  [{:keys [accountId]}]
  (not
   (q '[:find ?acc .
        :in $ ?a
        :where
        [?acc :account/index]
        (not [(= ?acc ?a)])
        (not [?acc :account/hidden true])
        [?g :accountGroup/account ?acc]
        [?g :accountGroup/vault ?v]
        [?v :vault/type ?type]
        (not [(= ?type "hw")])]
      accountId)))

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
        old-cur-acc        (and exist-app (:app/currentAccount (p [:app/currentAccount] exist-app)))
        accounts-changed?   (or (not exist-app) (and exist-app (not (= old-cur-acc currentAccount))))
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
    {:app            (e :app app)
     :newlyCreated   (not exist-app)
     :accountsChanged accounts-changed?}))

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

(defn get-address
  "Query and pull addrs

  1. return single addreess when :address/id can be identified, or return vector of addrs
  2. when :address/id and accountId can be identified, return addr with the specified account
  3. given selected: true, means get the addr of current account under current network, which fullfill 2
  4. given appId: X, means get the addr of X app's current account under app's current network, which fullfill 2

  ways to find single address
  1. addressId
  2. network+value
  3. network+account
  4. app -> network+account

  ways to find single address and single account
  1. addressId+accountId
  2. network+value+accountId
  3. network+account
  4. current: selected network+account
  5. app: app current selected network+account
  "
  [{:keys [addressId networkId hex value accountId groupId
           index tokenId appId selected fuzzy groupTypes g accountG networkType]}]
  (let [g                (if (and accountG (not (map? g))) {:eid 1} (and g (assoc g :eid 1)))
        g                (and g {:address g})
        accountG         (or accountG (get-in g [:address :_account]))
        accountG         (and accountG {:account accountG})
        post-process     (if (seq g) identity #(get % :db/id))
        post-process-acc (if (seq accountG) identity #(get % :db/id))
        addr             (if (string? value) [value] value)
        addr             (if (vector? addr) (map #(.toLowerCase %) addr) addr)
        hex              (if (string? hex) [hex] hex)
        hex              (if (vector? hex) (map #(.toLowerCase %) hex) hex)
        addressId        (if selected (get-current-addr) addressId)
        accountId        (if selected (q '[:find ?acc . :where [?acc :account/selected true]]) accountId)
        networkId        (if selected (q '[:find ?net . :where [?net :network/selected true]]) networkId)
        networkId        (if (int? appId) (q '[:find ?net . :in $ ?app :where [?app :app/currentNetwork ?net]] appId) networkId)
        accountId        (if (int? appId) (q '[:find ?acc . :in $ ?app :where [?app :app/currentAccount ?acc]] appId) accountId)
        addressId        (if (and (int? accountId) (int? networkId)) (:addressId (addr-acc-network {:accountId accountId :networkId networkId})) addressId)
        fuzzy        (if (string? fuzzy)
                       (.trim fuzzy)
                       nil)
        fuzzy        (if (and fuzzy (not (= fuzzy "")))
                       (re-pattern
                        (str "(?i)"
                             (-> fuzzy
                                 gstr/regExpEscape
                                 (.replaceAll " " ".*"))))
                       nil)]
    (prst->js
     (cond
       (vector? addressId)
       (pm (jsp->p g) addressId)
       ;; addressId is determined by
       ;; 1. selected true
       ;; 2. appId -> networkId + accountId
       ;; 3. directly passing in addressId
       ;; check these situations if there're hex/addr
       (and addressId (= (count addr) 1) (not (= (first addr) (:address/value (p '[:address/value] addressId)))))
       nil
       (and addressId (= (count hex) 1) (not (= (first hex) (:address/hex (p '[:address/hex] addressId)))))
       nil
       ;; can get single addressId
       (or addressId (and (int? networkId) (= (count addr) 1)))
       (let [addrId  (or addressId [:address/id [networkId (first addr)]])
             rst     (post-process (p (jsp->p g) addrId))
             acc-rst (if (int? accountId)
                       (post-process-acc (p (jsp->p accountG) accountId))
                       nil)
             rst     (if (and acc-rst (map? rst)) (assoc rst :account acc-rst) rst)]
         rst)
       :else
       (let [query-initial (cond-> '{:find  [[?addr ...]]
                                     :in    [$]
                                     :where [[?addr :address/id _]]
                                     :args []}
                             networkId
                             (-> (update :args conj (if (vector? networkId) networkId [networkId]))
                                 (update :in conj '[?net ...])
                                 (update :where conj '[?addr :address/network ?net]))
                             (and (not networkId) networkType)
                             (-> (update :args conj networkType)
                                 (update :in conj '?netType)
                                 (update :where conj
                                         '[?net :network/type ?netType]
                                         '[?addr :address/network ?net]))
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
                                 (update :where conj
                                         '[?acc :account/address ?addr]
                                         '[?gid :accountGroup/account ?acc]))
                             (and (not groupId) (seq groupTypes))
                             (-> (update :args conj groupTypes)
                                 (update :in conj '[?groupTypes ...])
                                 (update :where conj
                                         '[?acc :account/address ?addr]
                                         '[?gid :accountGroup/account ?acc]
                                         '[?gid :accountGroup/vault ?vault]
                                         '[?vault :vault/type ?groupTypes]))
                             fuzzy
                             (-> (update :args conj fuzzy)
                                 (update :in conj '?fuzzy)
                                 (update :where conj
                                         '[?acc :account/address ?addr]
                                         '[?acc :account/nickname ?acc-name]
                                         '[(re-find ?fuzzy ?acc-name)]))
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

(defnc upsert-memo [{:keys [networkId address memoId value]}]
  :let [addr-exists? (q '[:find ?addr .
                          :in $ [?net ?gaddr]
                          :where
                          [?addr :gaddr/network ?net]
                          [?addr :gaddr/value ?gaddr]]
                        [networkId address])
        gaddr-id (or addr-exists? "newgaddr")
        txs (enc/conj-when [] (and (not addr-exists?)
                                   {:db/id         gaddr-id
                                    :gaddr/network networkId
                                    :gaddr/value   address}))
        txs (conj txs {:db/id        (or memoId "newmemo")
                       :memo/gaddr gaddr-id
                       :memo/value   value})]
  (t txs))

(defnc get-memo [{:keys [address fuzzy networkId value g limit offset]}]
  :let [g     (and g {:memo g})
        limit (or limit 100)
        offset (or offset 0)
        fuzzy        (if (string? fuzzy)
                       (.trim fuzzy)
                       nil)
        fuzzy        (if (and fuzzy (not (= fuzzy "")))
                       (re-pattern
                        (str "(?i)"
                             (-> fuzzy
                                 gstr/regExpEscape
                                 (.replaceAll " " ".*"))))
                       nil)
        ;; id to data by `g`
        post-process (if (seq g) identity #(get % :db/id))
        post-process (fn [rst] (map post-process (if (seq rst) (pm (jsp->p g) rst) [])))
        addr         (cond (coll? address) address (string? address) [address] :else nil)
        addr (if addr (map #(.toLowerCase %) addr) nil)]

  :let [query-initial (cond-> '{:find [[?m ...]]
                                :in [$]
                                :where []
                                :args []}
                        networkId
                        (-> (update :args conj networkId)
                            (update :in conj '?net)
                            (update :where conj
                                    '[?ga :gaddr/network ?net]))
                        (not networkId)
                        (-> (update :where conj
                                    '[?net :network/selected true]
                                    '[?ga :gaddr/network ?net]))
                        addr
                        (-> (update :args conj addr)
                            (update :in conj '[?addr ...])
                            (update :where conj
                                    '[?ga :gaddr/value ?addr]))
                        value
                        (-> (update :args conj value)
                            (update :in conj '?value)
                            (update :where conj '[?m :memo/value ?value]))

                        true
                        (-> (update :where conj '[?m :memo/gaddr ?ga]))

                        (and (or (not value) (not addr)) fuzzy)
                        (-> (update :args conj fuzzy)
                            (update :in conj '?fuzzy))

                        (and (not value) (not addr) fuzzy)
                        (-> (update :where conj
                                    '(or
                                      (and
                                       [?m :memo/value ?v]
                                       [(re-find ?fuzzy ?v)])
                                      (and
                                       [?ga :gaddr/value ?v]
                                       [(re-find ?fuzzy ?v)]))))

                        (and addr (not value) fuzzy)
                        (-> (update :where conj
                                    '[?m :memo/value ?v]
                                    '[(re-find ?fuzzy ?v)]))
                        (and value (not addr) fuzzy)
                        (-> (update :where conj
                                    '[?ga :gaddr/value ?gav]
                                    '[(re-find ?fuzzy ?gav)])))
        query         (concat [:find] (:find query-initial)
                              [:in] (:in query-initial)
                              [:where] (:where query-initial))
        rst          (apply q query (:args query-initial))
        total        (count rst)
        rst (->> rst (sort >) (drop offset) (take limit) post-process)]
  {:total total :data rst})

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

(defn get-deleted-group-apps
  "Given to-delete groupId, find apps which authed with accounts in this group,
  return [txs sideeffects] to handle the deleted group"
  [{:keys [groupId]}]
  (let [accounts-in-group
        (q '[:find [?acc ...]
             :in $ ?g
             :where
             [?g :accountGroup/account ?acc]]
           groupId)
        apps-data
        (q '[:find ?app (distinct ?available-acc) ?current-acc
             :in $ [?acc ...]
             :where
             [?app :app/account ?acc]
             [?app :app/currentAccount ?curacc]
             [(= ?curacc ?acc) ?current-acc]
             [?app :app/account ?available-acc]
             ;; make sure available acc has addr in current net
             [?available-acc :account/address ?addr]
             [?addr :address/network ?net]
             [?net :network/selected true]]
           accounts-in-group)

        ->merge-and-deduplicate
        (fn [result item]
          (let [[appid accounts bool] item]
            (if (contains? result appid)
              (update result appid (fn [[deleted-accounts next-account current-group?]] [deleted-accounts next-account (or current-group? bool)]))
              (assoc result appid [(filter #(contains? (set accounts-in-group) %) accounts) (some #(when (not (contains? (set accounts-in-group) %)) %) accounts) bool]))))

        ;; format apps-data to {appid [deleted-accounts next-account current-group?]}
        processed-data (reduce ->merge-and-deduplicate {} apps-data)
        ;; format processed-data to [[appid deleted-accounts next-account current-group?]]
        final-data (into [] (mapv (fn [[k v]] (into [k] v)) processed-data))

        ->txs
        ;; txs: transactions send to db
        ;; sideeffects: methods to call in js to notify app
        ;; deleted-accounts is accounts that need to unauth in app
        ;; next-account is next available account in app, nil if no available account
        ;; current-group? is true if app's current account is in deleted group
        (fn [[txs sideeffects] [app-id deleted-accounts next-account current-group?]]
          (bc/cond
            :let
            [unauth-txs
             (mapv #(vector :db/retract app-id :app/account %) deleted-accounts)]
            ;; deleted group is current group of app and next-account is null
            ;; delete the app
            (and current-group? (nil? next-account))
            [txs (conj sideeffects [:wallet_deleteApp {:appId app-id}])]
            ;; deleted group is not current group of dapp and has available account in other group
            ;; unauth acc
            (not current-group?)
            [(concat txs unauth-txs) sideeffects]

            ;; deleted group is current group of app and app has available account in other group
            ;; switch current acc, unauth acc
            :else
            [(concat txs unauth-txs) (conj sideeffects [:wallet_setAppCurrentAccount {:appId app-id :accountId next-account}])]))]
    (reduce ->txs [[] []] final-data)))

(defn retract-group
  "used to retract account group"
  [{:keys [groupId]}]
  (let [addrs-in-group
        (q '[:find [?addr ...]
             :in $ ?g
             :where
             [?g :accountGroup/account ?acc]
             [?acc :account/address ?addr]]
           groupId)
        addrs-has-accs-not-in-group
        (q '[:find [?addr ...]
             :in $ ?g
             :where
             [?g :accountGroup/account ?acc]
             [?acc :account/address ?addr]
             [?account :account/address ?addr]
             [(!= ?account ?acc)]]
           groupId)
        addrs-to-delete (filter #(not (some #{%} addrs-has-accs-not-in-group)) addrs-in-group)
        txs             (mapv #(vector :db.fn/retractEntity %) addrs-to-delete)
        txs             (conj txs [:db.fn/retractEntity groupId])
        [apps-txs apps-sideeffects] (get-deleted-group-apps {:groupId groupId})
        txs            (concat txs apps-txs)]
    (t txs)
    (cleanup-token-list-after-delete-address)
    apps-sideeffects))

(defn retract-account
  "used to retract accounts"
  [{:keys [accountId hwVaultData]}]
  (let [addrs-in-account
        (q '[:find [?addr ...]
             :in $ ?acc
             :where
             [?acc :account/address ?addr]]
           accountId)
        addrs-has-other-accs
        (q '[:find [?addr ...]
             :in $ ?acc
             :where
             [?acc :account/address ?addr]
             [?account :account/address ?addr]
             [(!= ?account ?acc)]]
           accountId)
        addrs-to-delete (filter #(not (some #{%} addrs-has-other-accs)) addrs-in-account)
        txs             (mapv #(vector :db.fn/retractEntity %) addrs-to-delete)
        txs             (conj txs [:db.fn/retractEntity accountId])
        [apps-txs apps-sideeffects] (get-hidden-account-apps {:accountId accountId})

        vault (when hwVaultData
                (q '[:find ?vault .
                     :in $ ?acc
                     :where
                     [?group :accountGroup/account ?acc]
                     [?group :accountGroup/vault ?vault]]
                   accountId))
        txs   (enc/conj-when txs (and vault {:db/id vault :vault/data hwVaultData}))
        txs            (concat txs apps-txs)]
    (t txs)
    (cleanup-token-list-after-delete-address)
    apps-sideeffects))

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
  (let [addressId        targetAddressId
        address          (and (string? address) (.toLowerCase address))
        networkId        network
        token-exist?     (q '[:find ?t .
                              :in $ ?tid
                              :where
                              [?t :token/id ?tid]]
                            [networkId address])
        token-id         (or token-exist? -1)
        address          (and (string? address) (.toLowerCase address))
        add-token-tx     (when-not token-exist?
                           {:db/id          token-id
                            :token/name     name
                            :token/symbol   symbol
                            :token/decimals decimals
                            :token/network  networkId
                            :token/address  address
                            :token/fromUser (boolean fromUser)
                            :token/fromApp  (boolean fromApp)
                            :token/fromList (boolean fromList)})
        add-token-tx     (if (and image add-token-tx)
                           (assoc add-token-tx :token/logoURI image)
                           add-token-tx)
        token-in-addr?   (and token-exist?
                              (q '[:find ?t .
                                   :in $ ?taddr ?addr
                                   :where
                                   [?t :token/address ?taddr]
                                   [?addr :address/token ?t]]
                                 address addressId))
        addr-anti-token? (and token-exist?
                              (q '[:find ?t .
                                   :in $ ?addr ?t
                                   :where
                                   [?addr :address/antiToken ?t]]
                                 addressId token-id))
        txs              (if token-exist? [] [add-token-tx])
        txs              (enc/conj-when txs (and addr-anti-token? [:db/retract addressId :address/antiToken token-id]))
        txs              (if token-in-addr?
                           txs
                           (conj txs {:db/id addressId :address/token token-id}
                                 {:db/id "new-balance" :balance/value "0x0"}
                                 {:db/id addressId :address/balance "new-balance"}
                                 {:db/id token-id :token/balance "new-balance"}))
        tx-rst           (and (not checkOnly) (t txs))
        token-id         (if (and (not checkOnly) (= token-id -1)) (get-in tx-rst [:tempids -1]) token-id)]
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
  (let [cur-addr-only? (not (= type "all"))
        cur-net-only?  (not allNetwork)

        rst
        (and cur-net-only?
             (first
              (q '[:find (distinct ?addr) (distinct ?token)
                   :in $ ?caddr ?net
                   :where
                   [?addr :address/network ?net]
                   [?acc :account/address ?addr]
                   (or
                    (and [(true? ?caddr)]
                         [?acc :account/selected true])
                    (not [(true? ?caddr)]))
                   (or [?token :token/network ?net]
                       [(identity false) ?token])]
                 cur-addr-only? networkId)))

        rst
        (or (and rst [(into [networkId] rst)])
            (and (not cur-net-only?)
                 (q '[:find ?net (distinct ?addr) (distinct ?token)
                      :in $ ?caddr
                      :where
                      [?addr :address/network ?net]
                      [?acc :account/address ?addr]
                      (or
                       (and [(true? ?caddr)]
                            [?acc :account/selected true])
                       (not [(true? ?caddr)]))
                      (or [?token :token/network ?net]
                          [(identity false) ?token])]
                    cur-addr-only?)))

        process-rst
        (fn [[network-id address-ids token-ids]]
          [network-id
           [(mapv :address/value (pm [:address/value] address-ids))
            (into ["0x0"] (mapv :token/address (pm [:token/address] (disj token-ids false))))
            (p [:network/name :db/id] network-id)]])
        rst (mapv process-rst rst)]
    rst))

(defn upsert-balances
  [{:keys [networkId data]}]
  ;; data are [user-address token-balances] tuples
  ;; token-balances are [token-address balance] tuples
  (let [user-data->txs
        (fn [[uaddr acc] [taddr balance]]
          (bc/cond
            :let [taddr (name taddr)]
            ;; native token balance
            (= taddr "0x0")
            [uaddr (conj acc {:db/id                 [:address/id [networkId uaddr]]
                              :address/nativeBalance balance})]

            :let [anti-token? (q '[:find ?t .
                                   :in $ ?uaddr ?taddr
                                   :where
                                   [?u :address/id ?uaddr]
                                   [?t :token/id ?taddr]
                                   [?u :address/antiToken ?t]]
                                 [networkId uaddr] [networkId taddr])

                  ;; get balance entity by uaddr and taddr
                  balance-eid
                  (and (not anti-token?)
                       (q '[:find ?b .
                            :in $ ?uaddr ?taddr
                            :where
                            [?u :address/id ?uaddr]
                            [?t :token/id ?taddr]
                            [?u :address/balance ?b]
                            [?t :token/balance ?b]]
                          [networkId uaddr] [networkId taddr]))

                  ;; has balance
                  gt0?
                  (.gt (bn/BigNumber.from balance) 0)]

            (and (not gt0?) (not balance-eid))
            [uaddr acc]

            :let [tmp-balance-id
                  (str networkId uaddr taddr)

                  ;; upsert balance
                  acc
                  (enc/conj-when acc {:db/id         (or
                                                      balance-eid
                                                      tmp-balance-id)
                                      :balance/value balance}
                                 (and (not anti-token?)
                                      {:db/id         [:address/id [networkId uaddr]]
                                       :address/token [:token/id [networkId taddr]]}))

                  ;; bind new balance to address and token
                  acc
                  (if balance-eid
                    acc
                    (conj acc {:db/id           [:address/id [networkId uaddr]]
                               :address/balance tmp-balance-id}
                          {:db/id         [:token/id [networkId taddr]]
                           :token/balance tmp-balance-id}))]
            [uaddr acc]))

        data->txs (fn [acc [uaddr d]]
                    (let [uaddr (name uaddr)]
                      (second (reduce user-data->txs [uaddr acc] d))))

        txs (reduce data->txs [] data)]
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
        ;; token not from token list get deleted when link to zero addr
        from-list?            (and has-token? (:token/fromList token))
        no-other-linked-addr? (and (not from-list?)
                                   (-> (q '[:find [?addr ...]
                                            :in $ ?token
                                            :where
                                            [?addr :address/token ?token]]
                                          tokenId)
                                       count
                                       (= 1)))
        txs                   (if has-token? [[:db/retract addressId :address/token tokenId]
                                              [:db.fn/retractAttribute tokenId :token/fromUser]]
                                  [])
        ;; add to address black tokenlist if token is in new version tokenlist
        ;; so that it won't get auto watched once there's none zero balance
        txs                   (enc/conj-when txs (and (not no-other-linked-addr?) {:db/id addressId :address/antiToken tokenId}))
        txs                   (enc/conj-when txs (and no-other-linked-addr? [:db.fn/retractEntity tokenId]))
        ;; retract token will retract its balance automatically
        ;; so there's no need to retract balance if no-other-linked-addr? is true
        txs                   (enc/conj-when txs (and (not no-other-linked-addr?) has-balance?  [:db.fn/retractEntity has-balance?]))]
    (if has-token? (t txs) false)))

(defn get-addr-tx-by-hash [{:keys [addressId txhash]}]
  (->> (q '[:find ?tx .
            :in $ ?addr ?hash
            :where
            [?tx :tx/hash ?hash]
            [?addr :address/tx ?tx]
            [?addr :address/value ?addrv]
            [?tx :tx/txPayload ?payload]
            [?payload :txPayload/from ?addrv]]
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

(defn- tx-end-state? [hash]
  (try
    (let [status (:tx/status (p [:tx/status] [:tx/hash hash]))]
      (or (< status 0) (> status 4)))
    (catch js/Error e nil)))

(defn set-tx-skipped [{:keys [hash skippedChecked]}]
  (when-not (tx-end-state? hash)
    (if skippedChecked
      (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
          [:db.fn/retractAttribute [:tx/hash hash] :tx/skippedChecked]
          {:db/id [:tx/hash hash] :tx/status -2}])
      (t [{:db/id [:tx/hash hash] :tx/skippedChecked true}]))))
(defn set-tx-failed [{:keys [hash error]}]
  (when-not (tx-end-state? hash)
    (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
        {:db/id [:tx/hash hash] :tx/status -1 :tx/err error}])))
(defn set-tx-unsent [{:keys [hash resendAt]}]
  (when-not (tx-end-state? hash)
    (let [tx {:db/id [:tx/hash hash] :tx/status 0}
          tx (enc/assoc-when tx :tx/resendAt resendAt)]
      (t [tx]))))
(defn set-tx-sending [{:keys [hash resendAt]}]
  (when-not (tx-end-state? hash)
    (let [tx {:db/id [:tx/hash hash] :tx/status 1}
          tx (enc/assoc-when tx :tx/resendAt resendAt)]
      (t [tx]))))
(defn set-tx-pending [{:keys [hash]}]
  (when-not (tx-end-state? hash)
    (let [pending-at (:tx/pendingAt (p [:tx/pendingAt] [:tx/hash hash]))]
      (t [;; [:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
          {:db/id        [:tx/hash hash]
           :tx/status    2
           :tx/pendingAt (or pending-at (.now js/Date))}]))))
(defn force-set-tx-status [{:keys [hash status error]}]
  (let [txs [{:db/id [:tx/hash hash] :tx/status status}]]
    (if error
      (concat txs {:db/id [:tx/hash hash] :tx/err error})
      (concat txs [:db.fn/retractAttribute [:tx/hash hash] :tx/err]))
    (t txs)))
(defn set-tx-packaged [{:keys [hash blockHash]}]
  (when-not (tx-end-state? hash)
    (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/skippedChecked]
        {:db/id [:tx/hash hash] :tx/status 3 :tx/blockHash blockHash}])))
(defn set-tx-executed [{:keys [hash receipt]}]
  (when-not (tx-end-state? hash)
    (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/skippedChecked]
        {:db/id [:tx/hash hash] :tx/status 4 :tx/receipt receipt}])))

(defn set-tx-confirmed [{:keys [hash]}]
  (when-not (tx-end-state? hash)
    (let [confirmed
          (t [[:db.fn/retractAttribute [:tx/hash hash] :tx/raw]
              [:db.fn/retractAttribute [:tx/hash hash] :tx/skippedChecked]
              {:db/id [:tx/hash hash] :tx/status 5}])

         ;; find tx with
         ;; 1. same addr
         ;; 2. same nonce
         ;; 3. not in end state
         ;;
         ;; set them as failed
          replaced-none-finished-txs
          (q '[:find [?hash ...]
               :in $ ?confirmed-tx
               :where
               [?address :address/tx ?confirmed-tx]
               [?confirmed-tx :tx/txPayload ?payload]
               [?payload :txPayload/nonce ?nonce]
               [?address :address/tx ?tx]
               [?tx :tx/txPayload ?tx-payload]
               [?tx-payload :txPayload/nonce ?nonce]
               [?tx :tx/status ?status]
               [(>= ?status 0)]
               [(< ?status 5)]
               [?address :address/value ?addrv]
               [?tx-payload :txPayload/from ?addrv]
               [?tx :tx/hash ?hash]]
             [:tx/hash hash])]
      (doseq [hash replaced-none-finished-txs]
        (set-tx-failed {:hash hash :error "replacedByAnotherTx"}))
      confirmed)))
(defn set-tx-chain-switched [{:keys [hash]}]
  (t [{:db/id [:tx/hash hash] :tx/chainSwitched true}]))

(defn get-txs-to-enrich
  ([] (get-txs-to-enrich {}))
  ([{:keys [txhash type]}]
   (let [txs (q '[:find ?tx ?addr ?net ?token ?app
                  :in $ ?txhash ?nettype
                  :where
                  (or (and [(some? ?txhash)]
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
                               :app     (and app (e :app app))})
                     (fn [[tx addr net token app]]
                       {:tx      (e :tx tx)
                        :address addr
                        :network (e :network net)
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

(defnc get-recent-interesting-address-from-tx
  ;; "Get interesting address from tx

  ;; interesting means
  ;; 1. to addr of simple send tx
  ;; 2. send/transfer tx to 20/777 contract"
  [{:keys [limit offset fuzzy countOnly]}]
  ;; :do (js/console.time "get-recent-interesting-address-from-tx")
  :let  [limit  (or limit 10)
         offset (or offset 0)
         fuzzy        (if (string? fuzzy)
                        (.trim fuzzy)
                        nil)
         fuzzy        (if (and fuzzy (not (= fuzzy "")))
                        (re-pattern
                         (str "(?i)"
                              (-> fuzzy
                                  gstr/regExpEscape
                                  (.replaceAll " " ".*"))))
                        nil)

         ;; get all none contract to / transfer recipient
         ;; no dup address here
         addrs
         (q '[:find (distinct ?tx) ?address
              :in   $
              :where
              [?net :network/selected true]
              [?addr :address/network ?net]
              [?addr :address/tx ?tx]
              [?tx :tx/txExtra ?extra]
              [?tx :tx/txPayload ?payload]
              (or
               (and
                [?extra :txExtra/simple true]
                [?payload :txPayload/to ?address])
               (and
                [?extra :txExtra/token20 true]
                (or [?extra :txExtra/method "transfer"]
                    [?extra :txExtra/method "send"])
                [?extra :txExtra/address ?address]))])

         query
         {:find '[?tx ?address ?memo ?memov ?acc ?nick]
          :in       '[$ [[?tx ?address-from-tx]]]
          :where
          '[[?net :network/selected true]
            [(identity ?address-from-tx) ?address]
            [(vector ?net ?address) ?addr-id]
          ;; filter by memo
            (or-join  [?addr-id ?memo ?memov]
                      ;; has memo
                      (and
                       [(vector :gaddr/id ?addr-id) ?addr-id-ref]
                       [?memo :memo/gaddr ?addr-id-ref]
                       [?memo :memo/value ?memov])
                      ;; has no memo
                      (and
                       [(vector :gaddr/id ?addr-id) ?addr-id-ref]
                       (not [?memo :memo/gaddr ?addr-id-ref])
                       [(identity false) ?memo]
                       [(identity false) ?memov]))
          ;; filter by account nickname
            (or-join [?addr-id ?acc ?nick]
                     ;; is account
                     (and
                      [(vector :address/id ?addr-id) ?addr-id-ref]
                      [?acc :account/address ?addr-id-ref]
                      [?acc :account/nickname ?nick])
                     ;; is not account
                     (and
                      [(vector :address/id ?addr-id) ?addr-id-ref]
                      (not [?acc :account/address ?addr-id-ref])
                      [(identity false) ?acc]
                      [(identity false) ?nick]))]}

         query (if fuzzy
                 (-> query
                     (update :in conj '?fuzzy)
                     (update :where conj
                             '(or
                               (and [(and true ?nick)]
                                    [(re-find ?fuzzy ?nick)])
                               (and [(and true ?memov)]
                                    [(re-find ?fuzzy ?memov)])
                               [(re-find ?fuzzy ?address)])))
                 query)

         query (concat [:find] (:find query)
                       [:in] (:in query)
                       [:where] (:where query))

         addrs (if fuzzy (q query addrs fuzzy) (q query addrs))

         total (count addrs)]
  countOnly
  total

  :let [addrs (->> addrs
                   (sort-by
                    first
                    (fn [txsa txsb]
                      (> (->> txsa (sort >) first)
                         (->> txsb (sort >) first))))
                   (drop offset)
                   (take limit))

        format (fn [[_ addr memo-id memo-value acc-id nickname]]
                 (enc/assoc-when {:address addr}
                                 :memoId memo-id
                                 :memoValue memo-value
                                 :accountId acc-id
                                 :accountNickname nickname))]
  ;; :do (js/console.timeEnd "get-recent-interesting-address-from-tx")
  {:total total :data (map format addrs)})

(comment
  (get-recent-interesting-address-from-tx {:fuzzy " "}))

(defnc get-query-nonce [all-nonce in-wallet-nonce]
  ;; all-nonce min-nonce to max-nonce
  ;; in-wallet-nonce nonce that already in wallet
  :let [data (loop [all all-nonce
                    in  in-wallet-nonce
                    rst #{}]
               (let [nonce1 (first all)
                     nonce2 (second all)]
                 (if (and nonce1 nonce2)
                   (cond
                     (and (in nonce1) (in nonce2))
                     (recur (rest all) (disj in nonce1) rst)

                     (and (in nonce1) (not (in nonce2)))
                     (recur (rest all) (disj in nonce1) (conj rst nonce1))

                     (and (not (in nonce1)) (not (in nonce2)))
                     (recur (rest all) in rst)

                     :else
                     ;; (and (not (in nonce1)) (in nonce2))
                     (recur (rest all) in (conj rst nonce2)))
                   rst)))
        last-nonce (last all-nonce)]

  ;; last nonce is in wallet
  (data last-nonce)
  {:data data}

  ;; last nonce is not in wallet
  {:data data :last last-nonce})

(defn- ->mid [high]
  (-> high (/ 2) js/Math.floor))

(defn- search-nonce-gap [data]
  (let [high (dec (count data))
        mid  (->mid high)]
    (loop [d   [[data high mid]]
           rst []]
      rst
      (bc/cond
        :let [x (first d)]
        (nil? x)
        rst

        :let [[data high mid] x
              d (rest d)]
        (= high 1)
        (recur d (conj rst data))

        :let [n (fn [n] (first (nth data n)))
              sub (partial subvec data)
              lwrong (> (- (n mid) (n 0)) mid)
              hwrong (> (- (n high) (n mid)) (- high mid))

              d (enc/conj-when
                 d
                 (and lwrong [(sub 0 (inc mid)) mid (->mid mid)])
                 (and hwrong [(sub mid (inc high)) (- high mid) (->mid (- high mid))]))]
        (recur d rst)))))

(defnc query-latest-confirmed-tx [{:keys [addressId]}]
  (let [max-created (q '[:find (max ?created) .
                         :in $ ?addr
                         :where
                         [?addr :address/value ?addrv]
                         [?addr :address/tx ?tx]
                         (not [?tx :tx/fromScan true])
                         [?tx :tx/status 5]
                         [?tx :tx/txPayload ?payload]
                         [?payload :txPayload/from ?addrv]
                         [?tx :tx/created ?created]]
                       addressId)
        latest-tx   (and max-created
                         (q '[:find ?tx .
                              :in $ ?addr ?created
                              :where
                              [?addr :address/value ?addrv]
                              [?addr :address/tx ?tx]
                              [?tx :tx/txPayload ?payload]
                              [?payload :txPayload/from ?addrv]
                              [?tx :tx/created ?created]]
                            addressId max-created))]
    latest-tx))

(defnc query-nonce-gap-txs [{address-id :addressId next-nonce :nextNonce}]
  :let [tx-count (q '[:find (count ?tx) .
                      :in $ ?addr
                      :where
                      [?addr :address/value ?addrv]
                      [?addr :address/tx ?tx]
                      (not [?tx :tx/fromScan true])
                      [?tx :tx/status 5]
                      [?tx :tx/txPayload ?payload]
                      [?payload :txPayload/from ?addrv]]
                    address-id)]
  ;; no tx
  (zero? tx-count)
  nil
  :let [nonce-max (dec (js/parseInt next-nonce))
        nonce-min (q '[:find (min ?nonce) .
                       :in $ ?addr
                       :where
                       [?addr :address/tx ?tx]
                       [?addr :address/value ?addrv]
                       (not [?tx :tx/fromScan true])
                       [?tx :tx/status 5]
                       [?tx :tx/txPayload ?payload]
                       [?payload :txPayload/from ?addrv]
                       [?payload :txPayload/nonce ?nonce-hex]
                       [(js/parseInt ?nonce-hex) ?nonce]]
                     address-id)]
  (nil? nonce-min)
  nil

  :let [;; nonce is continuous
        nonce-continuous? (= tx-count (inc (- nonce-max nonce-min)))
        latest-tx (query-latest-confirmed-tx {:addressId address-id})
        latest-tx-receipt (and latest-tx (:tx/receipt (p [:tx/receipt] latest-tx)))
        latest-tx-block-or-epoch-number
        (and latest-tx
             (or
              (:epochNumber latest-tx-receipt)
              (:blockNumber latest-tx-receipt)))]

  ;; :do (prn nonce-max nonce-min)
  ;; get incoming txs when nonce is continuous
  nonce-continuous?
  [[[nil latest-tx-block-or-epoch-number] [nil "latest"]]]

  :let [;; get all successful txs' nonce and receipt
        nonces (q '[:find ?nonce
                    ;; ?block
                    ?receipt
                    ;; (pull ?tx [:tx/receipt {:tx/txPayload [:txPayload/nonce]}])
                    :in $ ?addr
                    :where
                    [?addr :address/value ?addrv]
                    [?addr :address/tx ?tx]
                    (not [?tx :tx/fromScan true])
                    [?tx :tx/status 5]
                    [?tx :tx/txPayload ?payload]
                    [?payload :txPayload/from ?addrv]
                    [?tx :tx/receipt ?receipt]
                    [?payload :txPayload/nonce ?n]
                    [(js/parseInt ?n) ?nonce]]
                  address-id)
        ;; get block/epoch number from receipt
        nonces (mapv (fn [[nonce receipt]] [nonce (or (:blockNumber receipt) (:epochNumber receipt))]) nonces)
        ;; get gaps in txlist
        gaps (search-nonce-gap nonces)]

  ;; empty gaps
  (nil? (seq gaps))
  [[[nil latest-tx-block-or-epoch-number] [nil "latest"]]]

  :let [;; if latest tx in the list
        has-latest? (if (= (-> nonces last first) nonce-max) true false)

        ;; always add latest gap
        gaps (conj gaps [(-> gaps last second)
                         (if has-latest?
                           [nil "latest"]
                           [nonce-max "latest"])])]
  gaps)

(comment
  (query-nonce-gap-txs {:addressId 116 :nextNonce "0x13d"})
  (search-nonce-gap (mapv #(vector % :a) [1 2 3 4 5 6 10 20 40]))
  (p '[*] 113)
  (query-nonce-gap-txs {:addressId 119 :nextNonce "0x39"})

  (p '[:tx/receipt {:tx/txPayload [:txPayload/nonce]}] 173))

(defnc insert-external-tx [{:keys [tx payload receipt addressId extra]}]
  :let [dup-tx? (some? (p [:db/id] [:tx/hash (:hash tx)]))]
  dup-tx?
  (t [{:db/id      addressId
       :address/tx [:tx/hash (:hash tx)]}])
  :let [new-tx (reduce-kv (fn [acc k v] (assoc acc (keyword :tx k) v)) {} tx)
        new-payload (reduce-kv (fn [acc k v] (assoc acc (keyword :txPayload k) v)) {} payload)
        new-extra (reduce-kv (fn [acc k v] (assoc acc (keyword :txExtra k) v)) {} extra)]
  (t [(assoc new-payload :db/id "new-payload")
      (assoc new-extra :db/id "new-extra")
      (assoc new-tx :db/id "new-tx"
             :tx/txPayload "new-payload"
             :tx/receipt receipt
             :tx/txExtra "new-extra")
      {:db/id      addressId
       :address/tx "new-tx"}]))

(comment
  (t (reduce (fn [acc id]
               (conj acc
                     {:db/id      (str "new-tx-extra" id)
                      :txExtra/ok false}
                     {:db/id      id
                      :tx/txExtra (str "new-tx-extra" id)}))
             []

             [178]))
  (p [:tx/txExtra] 176)
  (q '[:find [?tx ...]
       :in $
       :where
       [?tx :tx/hash _]
       [?tx :tx/txPayload ?payload]
       [?payload :txPayload/nonce "0x139"]])
  (get-txs-to-enrich)

  (:address/value (p [:address/value] 112))
  (q '[:find ?tx .
       :in $ ?nonce ?addr-id
       :where
       [?addr-id :address/tx ?tx]
       [?tx :tx/txPayload ?payload]
       [?payload :txPayload/nonce ?nonce]]
     "0x138" 112))

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

(defn- sort-tx [[_ _ createda] [_ _ createdb]]
  (cond
    ;; sort by created
    (> createda createdb)
    true

    ;; ;; sort by nonce
    ;; (.gt (bn/BigNumber.from noncea)
    ;;      (bn/BigNumber.from nonceb))
    ;; true

    ;; ;; sort by created order when with same nonce
    ;; (.eq (bn/BigNumber.from noncea)
    ;;      (bn/BigNumber.from nonceb))
    ;; (> txa txb)
    :else
    false))

(defn- ->single-nonce-tx-id
  "filter txs with same nonce and add tx/created value"
  [[_ tx-ids]]
  (->> tx-ids
       (sort >)
       (map (fn [tx-id] (let [tx (p [:tx/status :tx/created] tx-id)]
                          [tx-id (:tx/status tx) (:tx/created tx)])))
       (sort-by second >)
       first))

(defn- tx-id->data [id]
  (let [app-id   (->> id
                      (p [:app/_tx [:db/id]])
                      :app/_tx
                      first
                      :db/id)
        token-id (->> id
                      (p [:token/_tx [:db/id]])
                      :token/_tx
                      first
                      :db/id)]
    (-> (.toMap (e :tx id))
        (assoc :app (and app-id (e :app app-id)))
        (assoc :token (and token-id (e :token token-id))))))

(defn get-tx-with-same-nonce [{:keys [hash]}]
  (let [txs
        (q '[:find [?txs ...]
             :in $ ?tx
             :where
             [?address :address/tx ?tx]
             [?tx :tx/txPayload ?payload]
             [?payload :txPayload/nonce ?nonce]
             [?address :address/tx ?txs]
             [?txs :tx/txPayload ?tx-payload]
             [?tx-payload :txPayload/nonce ?nonce]
             [?address :address/value ?addrv]
             [?tx-payload :txPayload/from ?addrv]]
           [:tx/hash hash])]
    (when txs
      (mapv tx-id->data txs))))

(defn get-tx [{:keys [hash]}]
  (let [tx (q '[:find ?tx .
                :in  $ ?tx
                :where
                [?tx :tx/created]]
              [:tx/hash hash])]
    (when tx
      (tx-id->data tx))))

(defnc query-tx-list [{:keys [offset limit addressId tokenId appId extraType status countOnly]}]
  ;; :do (js/console.time "query-tx-list")
  :let [offset (or offset 0)
        limit  (min 100 (or limit 10))
        [status> status>= status< status<=]
        (if (map? status) [(:gt status)
                           (:gte status)
                           (:lt status)
                           (:lte status)]
            (repeat 4 nil))

        extraType (if (map? extraType) extraType nil)

        {ext-and :and ext-or :or} extraType

        ext-and-where (and (seq ext-and) (mapv (fn [[k v]] ['?extra (keyword "txExtra" k) v]) ext-and))
        ext-and-where (and ext-and-where (into ['[?tx :tx/txExtra ?extra]] ext-and-where))
        ext-or-where  (and (seq ext-or) (mapv (fn [[k v]] ['?extra (keyword "txExtra" k) v]) ext-or))
        ext-or-where  (and ext-or-where (vector '[?tx :tx/txExtra ?extra] (cons 'or ext-or-where)))

        query-initial
        (cond-> '{:find  [?nonce (distinct ?tx)]
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
          ext-and-where
          (-> (update :where into ext-and-where))
          ext-or-where
          (-> (update :where into ext-or-where))
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
        query (concat [:find] (:find query-initial)
                      [:in] (:in query-initial)
                      [:where] (:where query-initial))

        txs   (apply q query (:args query-initial))
        total (count txs)]
  countOnly  total
  :let  [txs (->> txs
                  ;; ["0x1a" #{188 192}]
                  ;; ["nonce" #{tx-id1 tx-id2}]
                  ;; tx-id1 tx-id2 has same nonce
                  (map ->single-nonce-tx-id)
                  (sort sort-tx)
                  (drop offset)
                  (take limit)
                  ;; get tx-id
                  (map first)
                  (map tx-id->data))]
  ;; :do (js/console.timeEnd "query-tx-list")
  {:total total
   :data  txs})

(comment
  (query-tx-list {}))

(defonce default-preferences {:hideTestNetwork           true
                              :overrideWindowDotEthereum false})

(defn get-preferences []
  (let [preferences (or (:preferences
                         (q '[:find (pull ?p [:preferences]) .
                              :where
                              [?p :preferences]]))
                        default-preferences)
        preferences (deep-merge default-preferences preferences)]
    preferences))

(defn set-preferences [preferences]
  (let [preferences (deep-merge (get-preferences) (or preferences {}))
        pref-id     (or (q '[:find ?p .
                             :where [?p :preferences]])
                        -1)
        txs         [{:db/id pref-id :preferences preferences}]]
    (t txs)
    true))

(def queries {:batchTx
              (fn [txs]
                (let [txs (-> txs js/globalThis.JSON.parse j->c)
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
              :forceSetTxStatus                    force-set-tx-status
              :getTxsToEnrich                      get-txs-to-enrich
              :cleanupTx                           cleanup-tx
              :findApp                             get-apps
              :findAddress                         get-address
              :findNetwork                         get-network
              :findAccount                         get-account
              :findToken                           get-token
              :findGroup                           get-group
              :findMemo                            get-memo
              :validateAddrInApp                   validate-addr-in-app
              :upsertTokenList                     upsert-token-list
              :retractNetwork                      retract-network
              :retractGroup                        retract-group
              :retractAccount                      retract-account
              :setPreferences                      set-preferences
              :getPreferences                      get-preferences
              :getAppsWithDifferentSelectedNetwork get-apps-with-different-selected-network
              :getAppAnotherAuthedNoneHWAccount    get-app-another-authed-none-hw-account
              :updateAccountWithHiddenHandler      update-account
              :isLastNoneHWAccount                 is-last-none-hw-account
              :getConnectedSitesWithoutApps        get-connected-sites-without-apps
              :upsertMemo                          upsert-memo
              :queryNonceGapTxs                    query-nonce-gap-txs
              :insertExternalTx                    insert-external-tx
              :queryTxWithSameNonce                get-tx-with-same-nonce

              :queryqueryRecentInterestingAddress get-recent-interesting-address-from-tx
              :queryqueryApp                      get-apps
              :queryqueryAddress                  get-address
              :queryqueryNetwork                  get-network
              :queryqueryAccount                  get-account
              :queryqueryMemo                     get-memo
              :queryqueryAccountGroup             get-account-group
              :queryqueryAccountList              get-account-list
              :queryqueryToken                    get-token
              :queryqueryGroup                    get-group
              :queryqueryBalance                  get-balance
              :querytxList                        query-tx-list
              :queryqueryTx                       get-tx
              :queryaccountListAssets             account-list-assets
              :getAccountGroupByVaultType         get-account-group-by-vault-type})

(defn apply-queries [rst conn qfn entity tfn ffn pfn]
  (defn pm [x eids]
    (db/pull-many @conn x eids))
  (def p pfn)
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
  (get-account-group {:networkId 6})
  (q '[:find ?n
       :where
       [?n :network/name]])
  (reduce-kv
   (fn [m groupId v]
     (let [v (map rest v)]
       (assoc m groupId
              (reduce-kv
               (fn [m accountId v]
                 (let [v (mapcat rest v)]
                   (assoc m accountId v)))
               {}
               (group-by first v)))))
   {}
   (group-by first (get-account-list {:networkId 7})))
  (get-account-list {})
  ;; => #{[51 53 52] [51 53 54] [56 58 57] [56 58 59] [56 60 52] [56 60 54]}
  (try
    (get-account-list {:networkId 7})
    (get-account-list {:addressG {:value 1} :accountG {:nickname 1}})
    (catch js/Error err
      (js/console.error err)))
  (get-address {:appId 64})
  (tap> (->> (q '[:find [?tx ...]
                  :where
                  [?tx :tx/txPayload _]])
             first
             (e :tx)
             .toMap)))
