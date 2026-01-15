(ns cfxjs.db.migrations.m16
  (:require
   [clojure.string :as str]
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]
   ["@fluent-wallet/consts" :refer [CFX_ESPACE_MAINNET_EXPLORER_URL CFX_ESPACE_TESTNET_EXPLORER_URL]]))

(def id 16)

(defn up
  "Migration function to update scanUrl for Conflux eSpace mainnet and testnet."
  [old-db]
  (let [deprecated-domain (str "confluxscan." "net")
        deprecated-espace-mainnet-scan-url (str/replace
                                             CFX_ESPACE_MAINNET_EXPLORER_URL
                                             #"confluxscan\.org"
                                             deprecated-domain)
        deprecated-espace-testnet-scan-url (str/replace
                                             CFX_ESPACE_TESTNET_EXPLORER_URL
                                             #"confluxscan\.org"
                                             deprecated-domain)
        query-by-scan-url '[:find ?net .
                            :in $ ?input-url
                            :where
                            [?net :network/scanUrl ?url]
                            [(= ?url ?input-url)]]
        espace-mainnet-id (d/q query-by-scan-url old-db deprecated-espace-mainnet-scan-url)
        espace-testnet-id (d/q query-by-scan-url old-db deprecated-espace-testnet-scan-url)
        txs [(when espace-mainnet-id
               {:db/id espace-mainnet-id
                :network/scanUrl CFX_ESPACE_MAINNET_EXPLORER_URL})
             (when espace-testnet-id
               {:db/id espace-testnet-id
                :network/scanUrl CFX_ESPACE_TESTNET_EXPLORER_URL})
             (update-version-tx old-db id)]
        txs (remove nil? txs)
        new-db (if (seq txs)
                 (d/db-with old-db txs)
                 old-db)]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})
