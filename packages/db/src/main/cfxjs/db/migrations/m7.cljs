(ns cfxjs.db.migrations.m7
  (:require
   [cfxjs.db.migutil :refer [update-version-tx]]
   [cfxjs.db.datascript.core :as d]))

(def id 7)

(defn up [old-db]
  (let [old-db
        (assoc-in
         old-db
         [:schema :account/address]
         (dissoc (get-in old-db [:schema :account/address]) :db/isComponent))

        txs    [(update-version-tx old-db id)]
        new-db (d/db-with old-db txs)]
    new-db))

(defn down [new-db]
  (let [new-db (assoc-in new-db [:schema :account/address :db/isComponent] true)
        txs                     [(update-version-tx new-db (dec id))]
        old-db                  (d/db-with new-db txs)]
    old-db))

(def data {:up up :down down :id id})
