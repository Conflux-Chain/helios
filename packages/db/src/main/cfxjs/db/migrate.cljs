(ns cfxjs.db.migrate
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migrations.core :refer [migrations]]))
;; 这个是处理脏数据的。怕数据结构和过去不兼容的话做一些更新。
;; 每个migrations就是要处理上个版本的数据
;; 最终根据上个版本的数据生成最新的数据
;; 需要注意是什么时候更新的数据库版本
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


