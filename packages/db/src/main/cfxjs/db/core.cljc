(ns cfxjs.db.core)

(defmacro def-get-by-query [attrk]
  '`[:find [~'?e ...]
     :in ~'$ ~'?v
     :where [~'?e ~attrk ~'?v]])

(defmacro def-get-query-or [query-attr-k symbols]
  '`[:find [~'?e ...]
     :in ~'$ ~symbols
     :where
     (~'or ~@(map-indexed (fn [idx symbol] ['?e (nth query-attr-k idx) symbol]) symbols))])

(defmacro def-get-query-and [query-attr-k symbols]
  '`[:find [~'?e ...]
     :in ~'$ ~symbols
     :where
     ~@(map-indexed (fn [idx symbol] ['?e (nth query-attr-k idx) symbol]) symbols)])

(defmacro def-get-one-query-and [query-attr-k symbols]
  '`[:find ~'?e .
     :in ~'$ ~symbols
     :where
     ~@(map-indexed (fn [idx symbol] ['?e (nth query-attr-k idx) symbol]) symbols)])

(defmacro def-get-all-query [all-attr-keys]
  '`[:find [~'?e ...]
     :where
     (~'or ~@(map #(conj ['?e %]) all-attr-keys))])
