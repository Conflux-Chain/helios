(ns cfxjs.db.migrations.m12
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 12)

(defn up [old-db]
  (let [chainid-integer->hex-txs
        (->> (d/q '[:find [?tx ...]
                    :where
                    [?net :network/type "eth"]
                    [?addr :address/tx ?tx]]
                  old-db)
             (d/pull-many old-db '[:db/id {:tx/txPayload [:db/id :txPayload/chainId]}])
             ;; get tx with integer chainid
             (filter (fn [{{chain-id :txPayload/chainId} :tx/txPayload}]
                       (js/Number.isInteger chain-id)))
             ;; dbtx change integer chainid into hex chainid
             (map (fn [{{chain-id :txPayload/chainId payload-id :db/id} :tx/txPayload}]
                    {:db/id             payload-id
                     :txPayload/chainId (str "0x" (.toString chain-id 16))})))
        new-db (d/db-with old-db (conj chainid-integer->hex-txs
                                       (update-version-tx old-db id)))]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})
