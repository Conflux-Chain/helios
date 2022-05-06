(ns cfxjs.spec.cljs
  (:refer-clojure
   :exclude [js->clj])
  (:require
   [oops.core :refer [ocall]]
   goog.math.Long
   goog.math.Integer
   [goog.object :as gobject]
   [goog.Uri]))

(defn js->clj
  "Recursively transforms JavaScript arrays into ClojureScript
  vectors, and JavaScript objects into ClojureScript maps.  With
  option ':keywordize-keys true' will convert object fields from
  strings to keywords."
  ([x] (js->clj x :keywordize-keys false))
  ([x & opts]
   (let [{:keys [keywordize-keys]} opts
         keyfn                     (if keywordize-keys keyword str)
         f                         (fn thisfn [x]
                                     (cond
                                       (satisfies? IEncodeClojure x)
                                       (-js->clj x (apply array-map opts))

                                       (seq? x)
                                       (doall (map thisfn x))

                                       (map-entry? x)
                                       (MapEntry. (thisfn (key x)) (thisfn (val x)) nil)

                                       (coll? x)
                                       (into (empty x) (map thisfn) x)

                                       (array? x)
                                       (persistent!
                                        (reduce #(conj! %1 (thisfn %2))
                                                (transient []) x))

                                       (identical? (type x) js/Object)
                                       (persistent!
                                        (reduce (fn [r k]
                                                  (let [v (gobject/get x k)]
                                                    (if (nil? v)
                                                      r
                                                      (assoc! r (keyfn k) (thisfn v)))))
                                                (transient {}) (js-keys x)))
                                       :else x))]
     (f x))))
