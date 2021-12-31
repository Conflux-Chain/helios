(ns cfxjs.db.migrate
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migrations.core :refer [migrations]]))

(defn run [old-db-conn]
  (let [v-eid (d/q '[:find ?v .
                     :where
                     [?v :dbmeta/version]] (d/db old-db-conn))
        v     (and v-eid (:dbmeta/version (d/pull (d/db old-db-conn) '[*] v-eid)))
        db    (d/db old-db-conn)
        db    (if v
                (if-let [to-run-migrations (seq (drop v migrations))]
                  (reduce (fn [acc migration] ((:up migration) acc))
                          db to-run-migrations)
                  db)
                (d/db-with db [{:db/id          -1
                                :dbmeta/version (->
                                                 migrations
                                                 last
                                                 :id)}]))]
    (d/conn-from-db db)))
