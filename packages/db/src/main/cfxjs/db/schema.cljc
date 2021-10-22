(ns cfxjs.db.schema)

(def current-schema (atom nil))

(defn- parse-attr-value [{:keys [ref many one doc identity value component persist index tuples]}]
  (cond ref              [:db/valueType :db.type/ref]
        many             [:db/cardinality :db.cardinality/many]
        one              [:db/cardinality :db.cardinality/one]
        doc              [:db/doc doc]
        identity         [:db/unique :db.unique/identity]
        value            [:db/unique :db.unique/value]
        index            [:db/unique :db/index]
        (false? persist) [:db/persist false]
        component        [:db/isComponent true]
        tuples           [:db/tupleAttrs (mapv keyword tuples)]))

(defn js-schema->schema
  "Convert js schema format to datascript schema,

  Example input js schema:

  ```js
  {
    vault: {
      type: {
        doc: 'Type of vault: public, pk, mnemonic',
      },
      data: {
        doc: 'Encrypted vault data',
      },
    },
    account: {
      hexAddress: {
        identity: true,
        doc: 'Account hex address',
      },
      vault: {
        ref: true,
        doc: 'Entity ID of vault',
      },
    },
  }
  ```

  Corresponding clj schema:

  ```clojure
  {:vault/type {:db/doc 'Type of vault: public pk mnemonic'}
   :vault/data {:db/doc 'Encrypted vault data'}
   :account/hexAddress {:db/unique :db.unique/identity
                        :db/doc 'Account hex address'}
   :account/vault {:db/valueType :db.type/ref
                   :db/doc 'Entity ID of vault'}}
  ```
"
  [s]
  (into {}
        (mapcat
         (fn [[parentk attrs]]
           (reduce-kv
            (fn [attrm attrk attrv]
              (assoc
               attrm
               (keyword (str (name parentk) "/" (name attrk)))
               (reduce-kv
                (fn [sm sk sv]
                  (let [[sk sv] (parse-attr-value {sk sv})]
                    (assoc sm sk sv)))
                {} attrv)))
            {} attrs))
         s)))

(defn js-schema->query-structure
  "Convert datascript schema from js to clj, example:

  From:
  ```js
  {
    vault: {
      type: {
        doc: 'Type of vault: public, pk, mnemonic',
      },
      data: {
        doc: 'Encrypted vault data',
      },
      accounts: {
        doc: 'Accounts belong to this vault',
        many: true,
        ref: 'account,
        component: true,
      },
    },
    account: {
      hexAddress: {
        identity: true,
        doc: 'Account hex address',
      },
      vault: {
        ref: 'vault,
        doc: 'Entity ID of vault',
      },
    },
  }
  ```

  To:
  ```clojure
  {:vault {:attr-keys (:type :data :accounts)
           :attrs {:type {:doc \"Type of vault: public pk mnemonic\"}
                   :data {:doc \"Encrypted vault data\"}
                   :accounts {:doc \"Accounts belong to this vault\"
                              :many true
                              :ref :account
                              :component true}}}
   :account {:attr-keys (:hexAddress :vault)
             :attrs {:hexAddress {:identity true
                                  :doc \"Account hex address\"}
                     :vault {:ref :vault
                             :doc \"Entity ID of vault\"}}}}
  ```
  "
  [s]
  (let [;; reduce-attr-property (fn [acc k3 v3] (if (= k :ref) (assoc acc k3 (keyword v3)) acc))
        reduce-model-attr (fn [acc k2 v2] (assoc acc k2 (reduce-kv
                                                         (fn [acc k3 v3] (cond
                                                                           (and (= k3 :ref) (string? v3)) (assoc acc :ref (keyword v3))
                                                                           (= k3 :ref) (assoc acc :ref k2)
                                                                           :else acc))
                                                         v2 v2)))
        reduce-schema-model (fn [acc k v]
                              (let [v (reduce-kv reduce-model-attr {} v)
                                    acc (assoc-in acc [k :attr-keys] (keys v))
                                    acc (assoc-in acc [k :attrs] v)]
                                acc))
        schema (reduce-kv reduce-schema-model {} s)]
    (reset! current-schema schema)
    @current-schema))

(defn qattr->model [qattr] (keyword (namespace qattr)))
(defn qattr->attrk [qattr] (keyword (name qattr)))

(defn model->attr-keys [model] (get-in @current-schema [model :attr-keys]))
(def qattr->attr-keys (comp model->attr-keys qattr->model))
(defn ref-qattr->model [qattr] (get-in @current-schema [(qattr->model qattr) :attrs (qattr->attrk qattr) :ref]))

(comment
  (let [schema {:vault {:type {:doc "Type of vault: public pk mnemonic"}
                        :data {:doc "Encrypted vault data"}
                        :accounts {:doc "Accounts belong to this vault"
                                   :many true
                                   :ref "account"
                                   :component true}}
                :account {:hexAddress {:identity true
                                       :doc "Account hex address"}
                          :vault {:ref "vault"
                                  :doc "Entity ID of vault"}}}]
    (js-schema->query-structure schema)))