(ns cfxjs.db.migrations.m13
  (:require
   [cfxjs.db.datascript.core :as d]
   ["@fluent-wallet/consts" :refer [ETH_SEPOLIA_EXPLORER_URL DEFAULT_CURRENCY_DECIMALS ETH_SEPOLIA_CURRENCY_SYMBOL ETH_SEPOLIA_CURRENCY_NAME ETH_SEPOLIA_NETID ETH_SEPOLIA_CHAINID ETH_SEPOLIA_RPC_ENDPOINT ETH_SEPOLIA_NAME CFX_MAINNET_RPC_ENDPOINT CFX_MAINNET_CHAINID CFX_ESPACE_MAINNET_RPC_ENDPOINT CFX_ESPACE_MAINNET_CHAINID CFX_TESTNET_RPC_ENDPOINT CFX_TESTNET_CHAINID CFX_ESPACE_TESTNET_RPC_ENDPOINT CFX_ESPACE_TESTNET_CHAINID]]
   [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 13)

(defn get-network-id  [db chainId chainType] (let [id (d/q '[:find ?net .
                                                              :in $ ?chainId ?chainType
                                                              :where
                                                              [?net :network/builtin true] [?net :network/type ?chainType]
                                                              [?net :network/chainId ?chainId]]
                                                            db chainId chainType)] id))



(defn up [old-db]
  (let [eth-hdpath-id (d/q '[:find ?hdpath .
                             :where
                             [?hdpath :hdPath/name "eth-default"]]
                           old-db)
        cfx-mainnet-id (get-network-id old-db CFX_MAINNET_CHAINID "cfx")
        cfx-testnet-id (get-network-id old-db CFX_TESTNET_CHAINID "cfx")
        cfx-espace-mainet-id (get-network-id old-db CFX_ESPACE_MAINNET_CHAINID "eth")
        cfx-espace-testnet-id (get-network-id old-db CFX_ESPACE_TESTNET_CHAINID "eth")
        sepolia {:db/id                  -10
                 :network/name           ETH_SEPOLIA_NAME
                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                 :network/endpoint       ETH_SEPOLIA_RPC_ENDPOINT
                 :network/type           "eth"
                 :network/hdPath         eth-hdpath-id
                 :network/chainId        ETH_SEPOLIA_CHAINID
                 :network/netId          ETH_SEPOLIA_NETID
                 :network/ticker         {:name     ETH_SEPOLIA_CURRENCY_NAME
                                          :symbol   ETH_SEPOLIA_CURRENCY_SYMBOL
                                          :decimals DEFAULT_CURRENCY_DECIMALS
                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                 :network/builtin        true
                 :network/scanUrl         ETH_SEPOLIA_EXPLORER_URL
                 :network/cacheTime      15000
                 :network/balanceChecker "0x55abba8d669d60a10c104cc493ec5ef389ec92bb"
                 :network/isTestnet      true
                 :network/gasBuffer      1.5}
        
        txs [{:db/id cfx-mainnet-id :network/endpoint CFX_MAINNET_RPC_ENDPOINT}
             {:db/id cfx-testnet-id :network/endpoint CFX_TESTNET_RPC_ENDPOINT}
             {:db/id cfx-espace-mainet-id :network/endpoint CFX_ESPACE_MAINNET_RPC_ENDPOINT}
             {:db/id  cfx-espace-testnet-id :network/endpoint CFX_ESPACE_TESTNET_RPC_ENDPOINT}
             sepolia
             (update-version-tx old-db id)]
        new-db         (d/db-with old-db txs)
        ]
    new-db))
(defn down [new-db] new-db)
(def data {:up up :down down :id id})
