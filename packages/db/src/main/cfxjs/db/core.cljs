(ns cfxjs.db.core
  (:require
   [cfxjs.db.datascript.core :as d]
   ;; [cfxjs.db.datascript.db :as ddb]
   [cfxjs.db.datascript.impl.entity :as de]
   [cfxjs.db.migrate]
   [cfxjs.db.queries :refer [apply-queries]]
   [cfxjs.db.schema :refer [js-schema->schema js-schema->query-structure model->attr-keys qattr->model]]
   [cfxjs.spec.cljs]
   [cljs.reader]
   [goog.string :as gs]
   [lambdaisland.glogi :as log]
   [lambdaisland.glogi.console :as glogi-console])
  (:require-macros [cfxjs.db.core :refer [def-get-by-query def-get-query-or def-get-query-and def-get-one-query-and def-get-all-query]]))

(glogi-console/install!)
(log/set-levels {:glogi/root (if goog.DEBUG :all :info)})

(defn random-tmp-id []
  (gs/getRandomString))

(defn j->c [v]
  (cfxjs.spec.cljs/js->clj v :keywordize-keys true))

;; debug
(set! (.-jtc js/globalThis) j->c)

(declare conn t q p e fdb)

(defn ->attrk
  "Say model is :account, attr is :hexAddress, ->attrk returns :account/hexAddress"
  [model attr]
  (keyword (str (name model) "/" (name attr))))

(defn- ->attr-symbol [attrk]
  (->> attrk (name) (str "?") (symbol)))

(defn- ->lookup-ref [arg]
  (reduce-kv (fn [_ k1 v1]
               (reduce-kv (fn [_ k2 v2] [(keyword (str (name k1) "/" (name k2))) v2]) nil v1))
             nil arg))

(comment
  (q '[:find ?s
       :where [243 :tx/status ?s]]))

(defn- parse-js-transact-arg
  ([arg] (parse-js-transact-arg arg (random-tmp-id)))
  ([arg tmp-id]
   (let [eid-arg  (:eid arg)
         arg      (cond
                    (or (int? eid-arg) (string? eid-arg))
                    (assoc arg :db/id eid-arg)
                    (and (map? eid-arg)
                         (= (count (keys eid-arg)) 1)
                         (map? (second (first eid-arg)))
                         (= (count (second (first eid-arg))) 1))
                    (let [model       (-> eid-arg first first)
                          attr        (-> eid-arg first second first first)
                          v           (-> eid-arg first second first second)
                          model-attrk (->attrk model attr)]
                      (assoc arg :db/id [model-attrk v]))
                    (:eid arg) (throw (js/Error. "Invalid eid, must be a string or integer"))
                    :else      (assoc arg :db/id tmp-id))
         arg      (dissoc arg :eid)
         all-keys (keys arg)
         _        (when-not (or (= (count all-keys) 1)
                                (and (= (count all-keys) 2)
                                     (some #{:db/id} all-keys)))
                    (throw (js/Error. "Invalid transaction params, too many top level keys")))
         arg
         (reduce-kv
          (fn [m k v]
            (let [->attrk (partial ->attrk k)
                  v
                  (cond
                    (map? v)
                    (reduce-kv
                     (fn [m k v]
                       (let [qualified-k (->attrk k)
                             ;; note, we can't use look up-ref as identifier in map-form
                             processed-v
                             (cond
                               (and (map? v) (-> v keys count (= 1)) (-> v first second map?)) ;; lookup-ref
                               (->lookup-ref v)
                               (vector? v) ;; db/isComponents
                               (map #(parse-js-transact-arg % (random-tmp-id)) v)
                               :else v)]
                         (assoc m qualified-k processed-v)))
                     {} v)
                    (= k :db/id) (assoc m k v)
                    :else        m)]
              (into m v)))
          {} arg)]
     arg)))

(defn def-get-fn
  "Given model eg. :vault, attr-keys eg. [:type :data] create the getVault function"
  [{:keys [attr-keys model]}]
  (let [f (fn [attr-map]
            (let [attr-map (and attr-map (j->c attr-map))
                  attr-map (if (empty? attr-map) nil attr-map)]
              (if (or (not attr-map) (:eid attr-map))
                (let [all-attr-keys (map (partial ->attrk model) attr-keys)
                      query         (def-get-all-query all-attr-keys)
                      eids          (q query)
                      eids          (if-let [eid (:eid attr-map)] (filter #(= eid %) eids) eids)]
                  eids)
                (let [data         (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                                      nil
                                                                      (let [symbol       (->attr-symbol attr)
                                                                            query-attr-k (->attrk model attr)
                                                                            value        (get attr-map attr)
                                                                            value        (or (get-in value [:_entity :db/id]) value)]
                                                                        [symbol query-attr-k value])))
                                                         attr-keys))
                      symbols      (mapv first data)
                      query-attr-k (mapv second data)
                      or?          (true? (:$or attr-map))
                      query        (if or? (def-get-query-or query-attr-k symbols)
                                       (def-get-query-and query-attr-k symbols))]
                  (q query (mapv #(get % 2) data))))))]
    (comp sort f)))

(defn def-get-by-id-fn
  "Given model eg. :vault, attr-keys eg. [:type :data] create the getVaultById function;"
  [{:keys [attr-keys model]}]
  (fn [eid]
    (when eid
      (let [first-entity-attr-keys (first (keys (de/touch (e model attr-keys eid))))]
        (when (and first-entity-attr-keys (= (name model) (namespace first-entity-attr-keys)))
          eid)))))

(defn def-delete-by-id-fn
  "Given model eg. :vault, attr-keys eg. [:type :data] create the getVaultById function;"
  [{:keys [get-fn]}]
  (fn [eid]
    (if (and (get-fn eid) (t [[:db.fn/retractEntity eid]])) true false)))

(defn def-get-one-fn
  [{:keys [attr-keys model]}]
  (let [f (fn [attr-map]
            (let [attr-map     (j->c attr-map)
                  _            (when (empty? attr-map) (throw (js/Error. "Invalid empty query map")))
                  data         (filter vector? (mapv (fn [attr] (if (not (contains? attr-map attr))
                                                                  nil
                                                                  (let [symbol       (->attr-symbol attr)
                                                                        query-attr-k (->attrk model attr)
                                                                        value        (get attr-map attr)
                                                                        value        (or (get-in value [:_entity :db/id]) value)]
                                                                    [symbol query-attr-k value])))
                                                     attr-keys))
                  symbols      (mapv first data)
                  query-attr-k (mapv second data)
                  query        (def-get-one-query-and query-attr-k symbols)
                  rst          (q query (mapv #(get % 2) data))]
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

;; (defn delete-by-id [id]
;;   (if (t [[:db.fn/retractEntity id]]) true false))

(defn def-delete-fn
  [get-fn]
  (fn [attr-map]
    (if (->> attr-map
             get-fn
             (map (fn [entity] [:db.fn/retractEntity (.-eid entity)]))
             t)
      true false)))

(defn def-update-fn
  [{:keys [model] :as arg}]
  (fn [attr-map updates]
    (when-let [updates (dissoc (j->c updates) :id)]
      (if-not (pos? (count (keys updates))) nil)
      (let [->attrk (partial ->attrk model)
            updates (reduce-kv (fn [m k v] (assoc m (->attrk k) v)) {} updates)
            eids    ((def-get-fn arg) attr-map)
            txs     (map (fn [eid] (merge updates {:db/id eid})) eids)
            rst     (t txs)]
        (if rst eids [])))))

(defn def-update-one-fn
  [{:keys [model] :as arg}]
  (fn [attr-map updates]
    (when-let [updates (dissoc (j->c updates) :id)]
      (if-not (pos? (count (keys updates))) nil)
      (let [->attrk (partial ->attrk model)
            updates (reduce-kv (fn [m k v] (assoc m (->attrk k) v)) {} updates)
            eid     ((def-get-one-fn arg) attr-map)
            txs     (merge updates {:db/id eid})
            rst     (t [txs])]
        (if rst eid nil)))))

(defn def-get-by-fn
  "Given model eg. :vault, attr eg. :type create the getVaultByType function"
  [{:keys [attr model]}]
  (let [attrk (->attrk model attr)
        query (def-get-by-query attrk)
        f     (fn [attrv] (q query attrv))]
    (comp sort f)))

(defn def-create-fn [{:keys [attr-keys model]}]
  (let [input-attr-map->transact-attr-map (fn [acc attr attrv]
                                            (if (some #{attr} attr-keys)
                                              (assoc acc (->attrk model attr) attrv) acc))
        f                                 (fn [attr-map]
                                            (let [attr-map (j->c attr-map)
                                                  attr-map (reduce-kv input-attr-map->transact-attr-map {:db/id -1} attr-map)]
                                              (t [attr-map])))
        guardf                            #(get-in % [:tempids -1])]
    (comp guardf f)))

(defn- js-query-model-structure->query-fn
  "Read a model structure, create getModel getModelByModelAttribute methods.
  Model structure are data like [[:vault :type] [:vault :data]]"
  [[model {:keys [attr-keys]}]]
  (let [model-name        (name model)
        Model-name        (str (.toUpperCase (subs model-name 0 1)) (subs model-name 1))
        ->entity          (fn [eid] (e model attr-keys eid))
        get-fn-k          (keyword (str "get" Model-name))
        get-fn            (comp clj->js #(map ->entity %) (def-get-fn {:model model :attr-keys attr-keys}))
        get-by-id-fn-k    (keyword (str "get" Model-name "ById"))
        get-by-id-fn      (comp clj->js ->entity (def-get-by-id-fn {:model model :attr-keys attr-keys}))
        delete-by-id-fn-k (keyword (str "delete" Model-name "ById"))
        delete-by-id-fn   (def-delete-by-id-fn {:get-fn get-by-id-fn})
        update-fn-k       (keyword (str "update" Model-name))
        update-fn         (comp clj->js #(map ->entity %) (def-update-fn {:model model :attr-keys attr-keys}))
        update-one-fn-k   (keyword (str "updateOne" Model-name))
        update-one-fn     (comp clj->js ->entity (def-update-one-fn {:model model :attr-keys attr-keys}))
        delete-fn-k       (keyword (str "delete" Model-name))
        delete-fn         (def-delete-fn get-fn)
        get-one-fn-k      (keyword (str "getOne" Model-name))
        get-one-fn        (comp clj->js ->entity (def-get-one-fn {:model model :attr-keys attr-keys}))
        delete-one-fn-k   (keyword (str "deleteOne" Model-name))
        delete-one-fn     (def-delete-one-fn {:model model :attr-keys attr-keys})
        create-fn-k       (keyword (str "create" Model-name))
        create-fn         (def-create-fn {:model model :attr-keys attr-keys})
        attr->attr-fn-map (fn [attr]
                            (if (= attr :id) {}
                                (let [attr-name   (name attr)
                                      Attr-name   (str (.toUpperCase (subs attr-name 0 1)) (subs attr-name 1))
                                      get-by-fn-k (keyword (str "get" Model-name "By" Attr-name))
                                      get-by-fn   (comp clj->js #(map ->entity %) (def-get-by-fn {:attr attr :model model}))]
                                  {get-by-fn-k get-by-fn})))]
    (apply merge {delete-one-fn-k   delete-one-fn
                  delete-fn-k       delete-fn
                  update-fn-k       update-fn
                  update-one-fn-k   update-one-fn
                  create-fn-k       create-fn
                  get-one-fn-k      get-one-fn
                  get-fn-k          get-fn
                  get-by-id-fn-k    get-by-id-fn
                  delete-by-id-fn-k delete-by-id-fn}
           (map attr->attr-fn-map attr-keys))))

;; (defn get-by-id [id]
;;   (when-let [data (d/pull (d/db conn) '[*] id)]
;;     (when-let [qattr (first (second data))]
;;       (let [model     (qattr->model qattr)
;;             attr-keys (model->attr-keys model)]
;;         (e model attr-keys (:db/id data))))))

;; (defn update-by-id [id updates]
;;   (when-let [^de/Entity entity (get-by-id id)]
;;     (let [updates (dissoc (j->c updates) :id)
;;           model   (.-model entity)
;;           ->attrk (partial ->attrk model)
;;           updates (reduce-kv (fn [m k v] (assoc m (->attrk k) v)) {} updates)]
;;       (if (t [(merge updates {:db/id id})]) (e model (.-attr-keys entity) (.-eid entity)) nil))))

(def read-db #(cljs.reader/read-string %))

(defn create-db
  "Create a database with js format schema, return a map with generated query methods for model and the database at :_db"
  ([js-schema] (create-db js-schema nil nil))
  ([js-schema persistfn] (create-db js-schema persistfn nil))
  ([js-schema persistfn data-to-restore]
   (let [js-schema     (j->c js-schema)
         db-to-restore (when data-to-restore (cljs.reader/read-string data-to-restore))
         schema-rst    (js-schema->schema js-schema)
         db-conn       (if db-to-restore (d/conn-from-db db-to-restore) (d/create-conn schema-rst))
         db-conn       (cfxjs.db.migrate/run db-conn)
         tfn           (fn [txs] (d/transact! db-conn txs))
         qfn           (fn [query & args] (apply d/q query (d/db db-conn) args))
         pfn           (fn [selector eid] (d/pull (d/db db-conn) selector eid))
         efn           (fn [model attr-keys & args] (apply de/entity (d/db db-conn) model attr-keys args))
         ffn           (fn [f] (d/filter (d/db db-conn) f))
         rst           (apply merge (map js-query-model-structure->query-fn (js-schema->query-structure js-schema)))
         rst           (assoc rst :_db db-conn)
         ;; rst           (assoc rst :getById (comp clj->js get-by-id))
         ;; rst           (assoc rst :deleteById delete-by-id)
         ;; rst           (assoc rst :updateById update-by-id)
         rst           (assoc rst :tmpid random-tmp-id)
         rst           (apply-queries rst db-conn qfn efn tfn ffn pfn)]
     (def conn db-conn)
     (def t tfn)
     (def q qfn)
     (def p pfn)
     (def e efn)
     (def fdb ffn)
     (defn db-transact [arg]
       (let [arg (j->c arg)
             arg (if (vector? arg) arg [arg])
             arg (filter map? arg)
             arg (map #(parse-js-transact-arg % (random-tmp-id)) arg)]
         (clj->js (t arg))))

     ;; (defn custom-pr-impl [obj writer opts]
     ;;   (-write writer (str "TYPE->" (type->str obj)))
     ;;   (pr-writer-impl obj writer opts))

     ;; (defn custom-pr-str [& objs]
     ;;   (pr-str-with-opts objs
     ;;                     (assoc (pr-opts) :alt-impl custom-pr-impl)))

     (when persistfn
       (d/listen! conn "persist" (fn [_]
                                   (->> conn
                                        d/db
                                        ;; custom-pr-str
                                        pr-str
                                        clj->js
                                        (.call persistfn nil)))))
     ;; (def kkk rst)
     (let [rst (assoc rst :t db-transact)
           rst (assoc rst :transact db-transact)]
       (clj->js rst)))))

;; for debug
(def jtc #(cfxjs.spec.cljs/js->clj % :keywordize-keys true))
(def ppp prn)
(def tppp tap>)

(comment
  (q '[:find [?e ...]
       :in $ ?gid
       :where
       [?g :accountGroup/nickname]
       [(?gid ?g)]
       [?g :accountGroup/account ?e]]
     #(= % 24))
  (create-db (.-schema js/globalThis))
  (:schema @conn)
  (js/console.log (clj->js (t [{:db/id "a" :hdPath/name "a"}
                               {:db/id "a" :hdPath/value "b"}])))
  (t [{:db/id -1 :hdPath/name "a"}
      {:db/id -2 :network/type "cfx"}
      {:db/id -3 :network/type "eth"}
      {:db/id -4 :vault/type "hd"}
      ;; {:db/id -5 :accountGroup/vault 4 :accountGroup/nickname "a"}
      ])
  (js/console.log (clj->js (t [{:address/network 2 :address/hex "a" :address/pk "b"}])))
  (t [{:db/id -5 :accountGroup/vault 4 :accountGroup/nickname "a"}])
  (js/console.log (clj->js (t [{:accountGroup/nickname "acc"}])))
  (q '[:find [?e ...]
       :where
       [?e :accountGroup/nickname "a"]])

  (q '[:find ?vault
       :keys vault
       :where
       [?vault :vault/type]])
  (d/pull @conn '[:network/name] 7)
  (d/pull @conn '[*] 9)
  (d/datoms
   (fdb (fn [db datom] (not= "vault" (namespace (:a datom)))))
   :eavt)
  (d/db? @conn)
  (d/db conn)
  (prn (-> @conn
           d/schema
           :address/value))
  (d/datoms (d/db conn) :eavt)
  (q '[:find ?v .
       :where [?v :dbmeta/version]])
  (t [{:db/id :dbmeta :dbmeta/version 1}])
  (d/schema (d/db conn)))
