(ns cfxjs.db.migrations.m11
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 11)

(defn up [old-db]
  (let [old-schema (d/schema old-db)
        new-schema (assoc old-schema
                          :memo/id
                          {:db/tupleAttrs [:memo/address :memo/value]
                           :db/unique     :db.unique/identity})
        txs        [(update-version-tx old-db id)]
        new-db     (d/db-with old-db txs)
        all-datoms (d/datoms new-db :eavt)
        new-db     (d/init-db all-datoms new-schema)]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})
