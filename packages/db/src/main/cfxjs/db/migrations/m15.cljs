(ns cfxjs.db.migrations.m15
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]
   ["@fluent-wallet/consts" :refer [CFX_MAINNET_EXPLORER_URL CFX_TESTNET_EXPLORER_URL]]))

(def id 15)

(defn up
  "Migration function to update scanUrl for Conflux mainnet and testnet."
  [old-db]
  (let [
        ;; --- Deprecated scan URLs ---
        deprecated-mainnet-scan-url "https://confluxscan.io"
        deprecated-testnet-scan-url "https://testnet.confluxscan.io"

        ;; --- Query to find a network by its scanUrl ---
        query-by-scan-url '[:find ?net .            
                            :in $ ?input-url        
                            :where
                            [?net :network/scanUrl ?url]
                            [(= ?url ?input-url)]] 

  
        cfx-mainnet-id (d/q query-by-scan-url old-db deprecated-mainnet-scan-url)
        cfx-testnet-id (d/q query-by-scan-url old-db deprecated-testnet-scan-url)

        txs [(when cfx-mainnet-id 
               {:db/id cfx-mainnet-id
                :network/scanUrl CFX_MAINNET_EXPLORER_URL})

             (when cfx-testnet-id 
               {:db/id cfx-testnet-id
                :network/scanUrl CFX_TESTNET_EXPLORER_URL})

             (update-version-tx old-db id)]

        txs (remove nil? txs)

        new-db (if (seq txs)
                 (d/db-with old-db txs) 
                 old-db)]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})