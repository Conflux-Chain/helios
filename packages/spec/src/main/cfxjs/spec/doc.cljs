(ns cfxjs.spec.doc
  (:require [malli.core :as m]
            [malli.error :refer [humanize]]))

(defn j->c [a] (js->clj a :keywordize-keys true))

(defn explain [schema data]
  (let [rst (humanize (m/explain (j->c schema) (js->clj data)))]
    (clj->js rst)))

(defn validate [schema data]
  (let [s (j->c schema)
        d (js->clj data)
        rst (m/validate s d)] rst))

(defn -recur [schema {::keys [recursion recursion-limit] :or {recursion-limit 4} :as options}]
  (let [form (m/form schema)
        i (get recursion form 0)]
    [(<= i recursion-limit) (update options ::recursion assoc form (inc i))]))

(defn -maybe-recur [schema options]
  (let [[recur options] (-recur schema options)]
    (when recur options)))

(defn -or-gen-doc
  ([schema] (-or-gen-doc schema nil))
  ([schema options]
   (or (first (m/children schema options)) (m/form schema options))))

(defn -schema-re
  ([schema] (-schema-re schema nil))
  ([schema options]
   (or (first (m/children schema options)) (m/form schema options))))

(defn -schema-type [schema]
  (or (-> schema
          m/properties
          :type)
      (-> schema
          m/type-properties
          :type)
      (-> schema
          m/type)))

(defn schema-type->html-type
  ([schema] (schema-type->html-type schema nil))
  ([schema {:doc/keys [htmlElement]}]
   (if htmlElement
     htmlElement
     (case (if (m/schema? schema) (m/type schema) schema)
       :mnemonic {:el :textarea}
       :password {:el :input}
       :int {:el :input :type :number}
       :double {:el :input :type :number}
       int? {:el :input :type :number}
       integer? {:el :input :type :number}
       pos-int? {:el :input :type :number}
       neg-int? {:el :input :type :number}
       nat-int? {:el :input :type :number}
       float-int? {:el :input :type :number}
       double-int? {:el :input :type :number}
       true? {:el :input :type :checkbox}
       false? {:el :input :type :checkbox}
       :boolean {:el :input :type :checkbox}
       :enum {:el :select :values (m/children schema)}
       {:el :input}))))

(defn -schema-get-doc
  ([schema] (-schema-get-doc schema nil))
  ([schema {:doc/keys [append prepend optional-key pdoc html-type gen-no-schema]}]
   (let [d (or (-> schema
                   m/properties
                   :doc)
               (-> schema
                   m/type-properties
                   :doc)
               (-> schema
                   m/form
                   :doc)
               pdoc
               (str (m/type schema) " " "no doc found"))
         d (if append (str d append) d)
         d (if prepend (str d prepend) d)
         rst {:doc d}
         rst (if gen-no-schema rst (assoc rst :schema schema))
         rst (if optional-key (assoc rst :optional true) rst)
         rst (if html-type (assoc rst :html-type html-type) rst)
         type (or (-schema-type schema) :unknown)
         type (if (= type :re) :regex type)
         rst (assoc rst :type (keyword type))
         rst (assoc rst :htmlElement (schema-type->html-type (if (= type :unknown) type schema)))]
     rst)))

(defmulti -schema-doc-generator (fn [schema options] (m/type schema options)) :default ::default)
(defmethod -schema-doc-generator ::default [schema options] {:type (keyword (m/type schema)) :value (-schema-get-doc schema options)})
(defmethod -schema-doc-generator :or [schema options] {:type :or :children (into [] (keep #(some->> (-maybe-recur % options) (-schema-doc-generator %)) (m/children schema options)))})
(defmethod -schema-doc-generator :and [schema options] {:type :and :children (into [] (keep #(some->> (-maybe-recur % options) (-schema-doc-generator %)) (m/children schema options)))})
(defmethod -schema-doc-generator :not [schema options] (let [rst (-schema-doc-generator schema options)
                                                             rst (assoc rst :not true)]
                                                         rst))
(defmethod -schema-doc-generator :re [schema options] (let [re (-schema-re schema options)
                                                            options (assoc options :doc/append (str ", confrom to regex " re))
                                                            rst (-schema-get-doc schema options)]
                                                        {:type :re :value rst}))
(defmethod -schema-doc-generator :map [schema options]
  (let [entries (m/entries schema)
        value-gen (fn [k s] (let [options (if (-> s m/properties :optional) (assoc options :doc/optional-key true) options)
                                 options (if (-> s m/properties :doc) (assoc options :doc/pdoc (-> s m/properties :doc)) options)
                                 rst (-schema-doc-generator s options)
                                 rst (assoc rst :kv true)
                                 rst (assoc rst :k k)]
                              rst))
        gen-req (->> entries
                     ;; (remove #(-> % last m/properties :optional))
                     (mapv (fn [[k s]] (value-gen k s))))]
    {:type :map :children gen-req}))

(defmethod -schema-doc-generator ::m/val [schema options]
  (-schema-doc-generator (first (m/children schema)) options))

(defn gen [schema options]
  (let [schema (js->clj schema :keywordize-keys true)
        options (js->clj options :keywordize-keys true)
        options (assoc options :doc/gen-no-schema (get options :noSchema))
        options (dissoc options :noSchema)]
    (clj->js (-schema-doc-generator schema options))))

(def export-explain explain)
(def export-validate validate)

(comment
  (def s (js->clj (-> js/window .-s .-mnemonic) :keywordize-keys true))
  (def s (js->clj (-> js/window .-s .-ethHexAddress) :keywordize-keys true))
  (def s (js->clj (-> js/window .-s .-addressType) :keywordize-keys true))
  (def s (js->clj (.-a js/window) :keywordize-keys true))
  (-schema-doc-generator s {})
  (->> (m/entries s)
       (map #(-> % last m/properties :optional)))
  (-schema-doc-generator [:map {:closed true} ["hdPath" :string]] {})
  (m/type (first (m/children (second (second (m/entries (nth (m/children s) 2)))))))
  (m/type s)
  (m/properties s)
  (m/type-properties s)
  (m/children s)
  (m/form s)
  (m/entries s))