(ns cfxjs.db.migrations.m14
  (:require
   [cfxjs.db.migutil :refer [update-version-tx]]
   ["@fluent-wallet/consts" :refer [ETH_GOERLI_CHAINID ETH_API_LIMIT_KEY]]
   [clojure.string :as str]
   [cfxjs.db.datascript.core :as d]))

(def id 14)

(def OLD_ETH_API_LIMIT_KEY "9aa3d95b3bc440fa88ea12eaa4456161")

(defn get-network-id  [db chainId chainType] (let [id (d/q '[:find ?net .
                                                             :in $ ?chainId ?chainType
                                                             :where
                                                             [?net :network/builtin true] [?net :network/type ?chainType]
                                                             [?net :network/chainId ?chainId]]
                                                           db chainId chainType)] id))

(defn up [old-db]
  (let [networks (d/q '[:find [(pull ?e [*]) ...]
                        :in $ ?suffix
                        :where
                        [?e :network/builtin true]
                        [?e :network/endpoint ?endpoint]
                        [(clojure.string/ends-with? ?endpoint ?suffix)]]
                      old-db OLD_ETH_API_LIMIT_KEY)
        eth-testnet-goerli-id (get-network-id old-db ETH_GOERLI_CHAINID "eth")
        txs (mapv (fn [{:db/keys [id] :network/keys [endpoint]}]
                    {:db/id id
                     :network/endpoint (str/replace endpoint OLD_ETH_API_LIMIT_KEY ETH_API_LIMIT_KEY)})
                  networks)
        txs (conj txs {:db/id eth-testnet-goerli-id :network/isCustom true :network/builtin false})
        new-db (d/db-with old-db (concat txs [(update-version-tx old-db id)]))]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})