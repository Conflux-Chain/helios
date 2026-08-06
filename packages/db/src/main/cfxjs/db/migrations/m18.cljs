(ns cfxjs.db.migrations.m18
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]
   ["@fluent-wallet/consts" :refer [CFX_ESPACE_TESTNET_CHAINID]]))

(def id 18)

(def token-list-name "eSpace Testnet")
(def token-list-url "https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx-espace.test.fluent.json")

(defn get-network-id [db]
  (d/q '[:find ?network .
         :in $ ?chain-id
         :where
         [?network :network/builtin true]
         [?network :network/type "eth"]
         [?network :network/chainId ?chain-id]]
       db
       CFX_ESPACE_TESTNET_CHAINID))

(defn has-token-list? [db network-id]
  (boolean
   (d/q '[:find ?token-list .
          :in $ ?network-id
          :where
          [?network-id :network/tokenList ?token-list]]
        db
        network-id)))

(defn up [old-db]
  (let [espace-testnet-id (get-network-id old-db)
        has-token-list (and espace-testnet-id
                            (has-token-list? old-db espace-testnet-id))
        txs (cond-> [(update-version-tx old-db id)]
              (and espace-testnet-id (not has-token-list))
              (conj {:db/id -1
                     :tokenList/name token-list-name
                     :tokenList/url token-list-url}
                    {:db/id espace-testnet-id
                     :network/tokenList -1}))]
    (d/db-with old-db txs)))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})
