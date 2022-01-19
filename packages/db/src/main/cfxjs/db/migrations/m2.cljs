(ns cfxjs.db.migrations.m2
  (:require
   [cfxjs.db.datascript.core :as d]))

(def id 2)

(defn- update-version-tx
  ([db] (update-version-tx db id))
  ([db custom-id]
   {:db/id (d/q '[:find ?v .
                  :where [?v :dbmeta/version]]
                db)
    :dbmeta/version custom-id}))

(defn up [old-db]
  (let [old-schema (d/schema old-db)
        new-schema (assoc old-schema :vault/device {:db/doc "vault device, default is FluentWebExt"})
        old-datoms (d/datoms old-db :eavt)
        new-db     (d/init-db old-datoms new-schema)
        txs        (->> (d/q '[:find [?vault ...]
                               :where
                               [?vault :vault/data]]
                             new-db)
                        (mapv (fn [vault-id]
                                {:db/id vault-id
                                 :vault/device "FluentWebExt"})))
        txs        (conj txs (update-version-tx new-db))
        new-db     (d/db-with new-db txs)]
    new-db))

(defn down [new-db]
  (let [new-schema (d/schema new-db)
        new-db     (d/db-with new-db (conj (->> (d/q '[:find [?vault ...]
                                                       :where [?vault :vault/device]]
                                                     new-db)
                                                (mapv (fn [vault-id]
                                                        [:db.fn/retractAttribute vault-id :vault/device])))
                                           (update-version-tx new-db (dec id))))
        old-datoms (d/datoms new-db :eavt)
        old-schema (dissoc new-schema :vault/device)
        old-db     (d/init-db old-datoms old-schema)]
    old-db))

(def data {:up up :down down :id id})
