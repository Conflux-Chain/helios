(ns cfxjs.spec.doc
  (:require [malli.core :as m]))

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

(defn -schema-get-doc
  ([schema] (-schema-get-doc schema nil))
  ([schema {:doc/keys [append prepend optional-key pdoc]}]
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
         d (if optional-key (str "[optional] " d) d)
         type (-schema-type schema)
         d (if type [(keyword type) d] [:unknown d])]
     d)))

(defmulti -schema-doc-generator (fn [schema options] (m/type schema options)) :default ::default)
(defmethod -schema-doc-generator ::default [schema options] (-schema-get-doc schema options))
(defmethod -schema-doc-generator :or [schema options] ["one of" (into [] (keep #(some->> (-maybe-recur % options) (-schema-doc-generator %)) (m/children schema options)))])
(defmethod -schema-doc-generator :and [schema options] ["and" (into [] (keep #(some->> (-maybe-recur % options) (-schema-doc-generator %)) (m/children schema options)))])
(defmethod -schema-doc-generator :re [schema options] (let [re (-schema-re schema options)
                                                            options (assoc options :doc/append (str ", confrom to regex " re))]
                                                        (-schema-get-doc schema options)))
(defmethod -schema-doc-generator :map [schema options]
  (let [entries (m/entries schema)
        value-gen (fn [k s] (let [options (if (-> s m/properties :optional) (assoc options :doc/optional-key true) options)
                                 options (if (-> s m/properties :doc) (assoc options :doc/pdoc (-> s m/properties :doc)) options)]
                             [k (-schema-doc-generator s options)]))
        gen-req (->> entries
                     ;; (remove #(-> % last m/properties :optional))
                     (mapv (fn [[k s]] (value-gen k s))))]
    ["map of" gen-req]))

(defmethod -schema-doc-generator ::m/val [schema options]
  (-schema-doc-generator (first (m/children schema)) options))

(def gen -schema-doc-generator)

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