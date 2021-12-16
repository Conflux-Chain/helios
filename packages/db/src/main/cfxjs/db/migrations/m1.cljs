(ns cfxjs.db.migrations.m1
  (:require
   [cfxjs.db.datascript.core :as d]))

(def id 1)

(defn- update-version-tx [db]
  {:db/id (d/q '[:find ?v .
                 :where [?v :dbmeta/version]]
               db)
   :dbmeta/version id})

(defn up [old-db]
  (let [old-schema (d/schema old-db)
        new-schema old-schema
        txs [(update-version-tx old-db)]
        new-db (d/db-with old-db txs)
        all-datoms (d/datoms new-db :eavt)
        new-db     (d/init-db all-datoms new-schema)]
    new-db))

(defn down [new-db]
  (let [old-db new-db]
    old-db))

(def data {:up up :down down :id id})