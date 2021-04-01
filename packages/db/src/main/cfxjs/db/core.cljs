(ns cfxjs.db.core
  (:require [datascript.core :as d]
            [cfxjs.db.impl.entity :refer [entity?] :as de])
  (:require-macros [cfxjs.db.core :refer [def-get-by-query def-get-query-or def-get-query-and def-get-one-query-and]]))

(defn j->c [v]
  (js->clj v :keywordize-keys true))

(def conn (atom nil))

(def t (partial d/transact! conn))
(def q (fn [query & args] (apply d/q query @conn args)))
(def p (partial d/pull @conn))
(defn e [& args] (apply de/entity @conn args))

(defn- parse-attr-value [{:keys [ref many one doc identity value component]}]
  (cond ref [:db/valueType :db.type/ref]
        many [:db/cardinality :db.cardinality/many]
        one [:db/cardinality :db.cardinality/one]
        doc [:db/doc doc]
        identity [:db/unique :db.unique/identity]
        value [:db/unique :db.unique/value]
        component [:db/isComponent true]))

(defn- js-schema->schema
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

(defn- js-schema->query-structure
  "Convert datascript schema from js to clj"
  [s]
  (map (fn [[parentk attrs]]
         (map (fn [[attrk]]
                [parentk attrk]) attrs)) s))

(defn ->attrk
  "Say model is :account, attr is :hexAddress, ->attrk returns :account/hexAddress"
  [model attr]
  (keyword (str (name model) "/" (name attr))))

(defn- entity->obj [e]
  (->> e (d/touch) (map (fn [[k v]] {(name k) v})) (apply merge) clj->js))

(defn entity->proxy [entity]
  (let [entity-keys (keys entity)
        ;; model (keyword (namespace (first entity-keys)))
        attrs (map (comp keyword name) entity-keys)]
    (apply merge
           {:_entity entity}
           {:toString #(->> entity entity->obj js/JSON.stringify)}
           {:toJSON #(entity->obj entity)}
           {:id (:db/id entity)}
           (map-indexed
            (fn [idx attr]
              (let [v (get entity (nth entity-keys idx))
                    v (if (entity? v) (entity->proxy v) v)]
                {attr v}))
            attrs))))

(defn- ->attr-symbol [attrs]
  (->> attrs (name) (str "?") (symbol)))

(defn def-get-fn
  "Given model eg. :vault, attrs eg. [:type :data] create the getVault function"
  [{:keys [attrs model]}]
  (let [f (fn [attr-map]
            (let [attr-map (j->c attr-map)
                  data (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                          nil
                                                          (let [symbol (->attr-symbol attr)
                                                                query-attr-k (->attrk model attr)
                                                                value (get attr-map attr)
                                                                value (or (get-in value [:_entity :db/id]) value)]
                                                            [symbol query-attr-k value])))
                                             attrs))
                  symbols (mapv first data)
                  query-attr-k (mapv second data)
                  or? (true? (get attr-map :$or))
                  query (if or? (def-get-query-or query-attr-k symbols)
                            (def-get-query-and query-attr-k symbols))]
              (q query (mapv #(get % 2) data))))]
    f))

(defn def-get-one-fn
  [{:keys [attrs model]}]
  (let [f (fn [attr-map]
            (let [attr-map (j->c attr-map)
                  data (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                         nil
                                                         (let [symbol (->attr-symbol attr)
                                                               query-attr-k (->attrk model attr)
                                                               value (get attr-map attr)
                                                               value (or (get-in value [:_entity :db/id]) value)]
                                                           [symbol query-attr-k value])))
                                             attrs))
                  symbols (mapv first data)
                  query-attr-k (mapv second data)
                  query (def-get-one-query-and query-attr-k symbols)
                  rst (q query (mapv #(get % 2) data))]
              rst))]
    f))

(defn def-delete-one-fn
  [arg]
  (let [f (comp
           #(try
              (and (t [[:db.fn/retractEntity %]]) true)
              (catch js/Object e
                ;; no need to write error to console when failed to delete
                ;; (js/console.error e)
                false))
           (def-get-one-fn arg))]
    f))

(defn def-get-by-fn
  "Given model eg. :vault, attr eg. :type create the getVaultByType function"
  [{:keys [attr model]}]
  (let [attrk (->attrk model attr)
        query (def-get-by-query attrk)
        f (fn [attrv] (q query attrv))]
    f))

(defn def-create-fn [{:keys [attrs model]}]
  (let [input-attr-map->transact-attr-map (fn [acc attr attrv]
                                            (if (some #{attr} attrs)
                                              (assoc acc (->attrk model attr) attrv) acc))
        f (fn [attr-map]
            (let [attr-map (j->c attr-map)
                  attr-map (reduce-kv input-attr-map->transact-attr-map {:db/id -1} attr-map)]
              (t [attr-map])))
        guardf #(get-in % [:tempids -1])]
    (comp guardf f)))

(defn- js-query-model-structure->query-fn
  "Read a model structure, create getModel getModelByModelAttribute methods.
  Model structure are data like [[:vault :type] [:vault :data]]"
  [struct]
  (let [model (first (first struct))
        model-name (name model)
        Model-name (str (.toUpperCase (subs model-name 0 1)) (subs model-name 1))
        attrs (map second struct)
        get-fn-k (keyword (str "get" Model-name))
        get-fn (comp clj->js #(map (comp entity->proxy e) %) (def-get-fn {:model model :attrs attrs}))
        get-one-fn-k (keyword (str "getOne" Model-name))
        get-one-fn (comp clj->js entity->proxy e (def-get-one-fn {:model model :attrs attrs}))
        delete-one-fn-k (keyword (str "deleteOne" Model-name))
        delete-one-fn (def-delete-one-fn {:model model :attrs attrs})
        create-fn-k (keyword (str "create" Model-name))
        create-fn (def-create-fn {:model model :attrs attrs})
        attr->attr-fn-map (fn [attr]
                            (let [attr-name (name attr)
                                  Attr-name (str (.toUpperCase (subs attr-name 0 1)) (subs attr-name 1))
                                  get-by-fn-k (keyword (str "get" Model-name "By" Attr-name))
                                  get-by-fn (comp clj->js #(map (comp entity->proxy e) %) (def-get-by-fn {:attr attr :model model}))]
                              {get-by-fn-k get-by-fn}))]
    (apply merge {delete-one-fn-k delete-one-fn} {create-fn-k create-fn} {get-one-fn-k get-one-fn} {get-fn-k get-fn} (map attr->attr-fn-map attrs))))

(defn create-db
  "Create a database with js format schema, return a map with generated query methods for model and the database at :_db"
  [js-schema]
  (let [js-schema (j->c js-schema)
        db (d/create-conn (js-schema->schema js-schema))
        rst (apply merge (map js-query-model-structure->query-fn (js-schema->query-structure js-schema)))
        rst (assoc rst :_db db)]
    (reset! conn @db)
    ;; (def kkk rst)
    (clj->js rst)))

(comment
  (satisfies? IEncodeClojure (new js/Proxy #js {} #js {:get (fn [a b c] (js/console.log a b c) (js-debugger))}))
  (let [attrk :vault/type
        query (def-get-by-query attrk)]
    (q query "public"))
  (let [keywords [:vault/type :vault/data]
        symbols ['?type '?data]
        query (def-get-query-and keywords symbols)]
    (q query {:type "public"}))
  (->> 4
       (e)
       (d/touch)
       (map (fn [[k v]] {(name k) v}))
       (apply merge))
  (q '[:find [?e ...]
       :in $ ?v
       :where
       [?e :vault/type ?v]] "public")
  (:vault/type (e 1))
  (p '[*] [1 2 3 4 5]))