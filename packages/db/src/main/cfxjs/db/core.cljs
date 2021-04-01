(ns cfxjs.db.core
  (:require [datascript.core :as d]
            [cfxjs.db.impl.entity :refer [entity?] :as de]
            [cfxjs.db.schema :refer [js-schema->schema js-schema->query-structure]])
  (:require-macros [cfxjs.db.core :refer [def-get-by-query def-get-query-or def-get-query-and def-get-one-query-and]]))

(defn j->c [v]
  (js->clj v :keywordize-keys true))

(def conn (atom nil))

(def t (partial d/transact! conn))
(def q (fn [query & args] (apply d/q query @conn args)))
(def p (partial d/pull @conn))
(defn e [model attr-keys & args] (apply de/entity @conn model attr-keys args))

(defn ->attrk
  "Say model is :account, attr is :hexAddress, ->attrk returns :account/hexAddress"
  [model attr]
  (keyword (str (name model) "/" (name attr))))

(defn- ->attr-symbol [attrk]
  (->> attrk (name) (str "?") (symbol)))

(defn def-get-fn
  "Given model eg. :vault, attr-keys eg. [:type :data] create the getVault function"
  [{:keys [attr-keys model]}]
  (let [f (fn [attr-map]
            (let [attr-map (j->c attr-map)
                  data (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                          nil
                                                          (let [symbol (->attr-symbol attr)
                                                                query-attr-k (->attrk model attr)
                                                                value (get attr-map attr)
                                                                value (or (get-in value [:_entity :db/id]) value)]
                                                            [symbol query-attr-k value])))
                                             attr-keys))
                  symbols (mapv first data)
                  query-attr-k (mapv second data)
                  or? (true? (get attr-map :$or))
                  query (if or? (def-get-query-or query-attr-k symbols)
                            (def-get-query-and query-attr-k symbols))]
              (q query (mapv #(get % 2) data))))]
    f))

(defn def-get-one-fn
  [{:keys [attr-keys model]}]
  (let [f (fn [attr-map]
            (let [attr-map (j->c attr-map)
                  data (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                          nil
                                                          (let [symbol (->attr-symbol attr)
                                                                query-attr-k (->attrk model attr)
                                                                value (get attr-map attr)
                                                                value (or (get-in value [:_entity :db/id]) value)]
                                                            [symbol query-attr-k value])))
                                             attr-keys))
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

(defn def-create-fn [{:keys [attr-keys model]}]
  (let [input-attr-map->transact-attr-map (fn [acc attr attrv]
                                            (if (some #{attr} attr-keys)
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
  [[model {:keys [attr-keys]}]]
  (let [model-name (name model)
        Model-name (str (.toUpperCase (subs model-name 0 1)) (subs model-name 1))
        ->entity (partial e model attr-keys)
        get-fn-k (keyword (str "get" Model-name))
        get-fn (comp clj->js #(map ->entity %) (def-get-fn {:model model :attr-keys attr-keys}))
        get-one-fn-k (keyword (str "getOne" Model-name))
        get-one-fn (comp clj->js ->entity (def-get-one-fn {:model model :attr-keys attr-keys}))
        delete-one-fn-k (keyword (str "deleteOne" Model-name))
        delete-one-fn (def-delete-one-fn {:model model :attr-keys attr-keys})
        create-fn-k (keyword (str "create" Model-name))
        create-fn (def-create-fn {:model model :attr-keys attr-keys})
        attr->attr-fn-map (fn [attr]
                            (let [attr-name (name attr)
                                  Attr-name (str (.toUpperCase (subs attr-name 0 1)) (subs attr-name 1))
                                  get-by-fn-k (keyword (str "get" Model-name "By" Attr-name))
                                  get-by-fn (comp clj->js #(map ->entity %) (def-get-by-fn {:attr attr :model model}))]
                              {get-by-fn-k get-by-fn}))]
    (apply merge {delete-one-fn-k delete-one-fn} {create-fn-k create-fn} {get-one-fn-k get-one-fn} {get-fn-k get-fn} (map attr->attr-fn-map attr-keys))))

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

(def jtc #(clj->js % :keywordize-keys true))
(def ppp prn)
(def tppp tap>)

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
       (de/touch)
       (map (fn [[k v]] {(name k) v}))
       (apply merge))
  (q '[:find [?e ...]
       :in $ ?v
       :where
       [?e :vault/type ?v]] "public")
  (:vault/type (e 1))
  (p '[*] [1 2 3 4 5]))