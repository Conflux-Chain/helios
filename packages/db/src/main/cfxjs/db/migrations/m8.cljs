(ns cfxjs.db.migrations.m8
  (:require
   [cfxjs.db.migutil :refer [update-version-tx]]
   [cfxjs.db.datascript.core :as d]))

(def id 8)

(defn up [old-db]
  (let [pref-id (d/q '[:find ?p .
                       :where [?p :preferences]]
                     old-db)
        prefs   (when pref-id (d/pull old-db [:preferences] pref-id))
        txs     (if pref-id
                  [(assoc  prefs :hideTestNetwork true
                           :db/id pref-id)]
                  [])
        txs     (conj txs (update-version-tx old-db id))
        new-db  (d/db-with old-db txs)]
    new-db))

(defn down [new-db]
  (let [pref-id (d/q '[:find ?p .
                       :where [?p :preferences]]
                     new-db)
        prefs   (when pref-id (d/pull new-db [:preferences] pref-id))
        txs     (if pref-id
                  [{:db/id pref-id :preferences (assoc prefs :hideTestNetwork false)}]
                  [])
        txs     (conj txs (update-version-tx new-db (dec id)))
        old-db  (d/db-with new-db txs)]
    old-db))

(def data {:up up :down down :id id})
