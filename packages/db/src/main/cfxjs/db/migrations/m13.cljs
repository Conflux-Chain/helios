(ns cfxjs.db.migrations.m13
  (:require
   [cfxjs.db.datascript.core :as d]
   ["@fluent-wallet/consts" :refer [CFX_MAINNET_RPC_ENDPOINT CFX_MAINNET_CHAINID CFX_ESPACE_MAINNET_RPC_ENDPOINT CFX_ESPACE_MAINNET_CHAINID CFX_TESTNET_RPC_ENDPOINT CFX_TESTNET_CHAINID CFX_ESPACE_TESTNET_RPC_ENDPOINT CFX_ESPACE_TESTNET_CHAINID]]
   [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 13)

(defn get-network-id  [db chainId chainType] (let [id (d/q '[:find ?net .
                                                              :in $ ?chainId ?chainType
                                                              :where
                                                              [?net :network/builtin true] [?net :network/type ?chainType]
                                                              [?net :network/chainId ?chainId]]
                                                            db chainId chainType)] id))

(defn up [old-db]
  (let [cfx-mainnet-id (get-network-id old-db CFX_MAINNET_CHAINID "cfx")
        cfx-testnet-id (get-network-id old-db CFX_TESTNET_CHAINID "cfx")
        cfx-espace-mainet-id (get-network-id old-db CFX_ESPACE_MAINNET_CHAINID "eth")
        cfx-espace-testnet-id (get-network-id old-db CFX_ESPACE_TESTNET_CHAINID "eth")
        txs            [{:db/id cfx-mainnet-id :network/endpoint CFX_MAINNET_RPC_ENDPOINT}
                        {:db/id cfx-testnet-id :network/endpoint CFX_TESTNET_RPC_ENDPOINT}
                        {:db/id cfx-espace-mainet-id :network/endpoint CFX_ESPACE_MAINNET_RPC_ENDPOINT}
                        {:db/id  cfx-espace-testnet-id :network/endpoint CFX_ESPACE_TESTNET_RPC_ENDPOINT}
                        (update-version-tx old-db id)]
        new-db         (d/db-with old-db txs)]
    
    new-db))
(defn down [new-db] new-db)
(def data {:up up :down down :id id})
