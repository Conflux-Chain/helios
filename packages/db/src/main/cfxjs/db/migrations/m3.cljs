(ns cfxjs.db.migrations.m3
  (:require
   [cfxjs.db.datascript.core :as d]))

(def id 3)

(defn- update-version-tx
  ([db] (update-version-tx db id))
  ([db custom-id]
   {:db/id (d/q '[:find ?v .
                  :where [?v :dbmeta/version]]
                db)
    :dbmeta/version custom-id}))

(defn up [old-db]
  (let [cfx-mainnet-id (d/q '[:find ?net .
                              :where
                              [?net :network/builtin true]
                              [?net :network/type "cfx"]
                              [?net :network/chainId "0x405"]]
                            old-db)
        cfx-testnet-id (d/q '[:find ?net .
                              :where
                              [?net :network/builtin true]
                              [?net :network/type "cfx"]
                              [?net :network/chainId "0x1"]]
                            old-db)
        txs            [{:db/id cfx-mainnet-id :network/name "Conflux Tethys"}
                        {:db/id cfx-testnet-id :network/name "Conflux Testnet"}
                        (update-version-tx old-db)]
        new-db         (d/db-with old-db txs)]
    new-db))

(defn down [new-db]
  (let [cfx-mainnet-id (d/q '[:find ?net .
                              :where
                              [?net :network/builtin true]
                              [?net :network/type "cfx"]
                              [?net :network/chainId "0x405"]]
                            new-db)
        cfx-testnet-id (d/q '[:find ?net .
                              :where
                              [?net :network/builtin true]
                              [?net :network/type "cfx"]
                              [?net :network/chainId "0x1"]]
                            new-db)
        txs            [{:db/id cfx-mainnet-id :network/name "CFX_MAINNET"}
                        {:db/id cfx-testnet-id :network/name "CFX_TESTNET"}
                        (update-version-tx new-db (dec id))]
        old-db         (d/db-with new-db txs)]
    old-db))

(def data {:up up :down down :id id})
