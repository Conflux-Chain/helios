(ns cfxjs.db.queries)

(def queries {})

(defn apply-queries [conn]
  (assoc conn :q queries))
