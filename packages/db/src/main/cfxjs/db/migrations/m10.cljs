(ns cfxjs.db.migrations.m10
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 10)

(defn up [old-db]
  (let [new-schema
        {:account/address      {:db/cardinality :db.cardinality/many
                                :db/valueType   :db.type/ref}
         :accountGroup/account {:db/cardinality :db.cardinality/many
                                :db/isComponent true
                                :db/valueType   :db.type/ref}
         :accountGroup/vault   {:db/isComponent true
                                :db/unique      :db.unique/identity
                                :db/valueType   :db.type/ref}
         :address/antiToken    {:db/cardinality :db.cardinality/many
                                :db/valueType   :db.type/ref}
         :address/balance      {:db/cardinality :db.cardinality/many
                                :db/isComponent true
                                :db/valueType   :db.type/ref}
         :address/id           {:db/tupleAttrs [:address/network :address/value]
                                :db/unique     :db.unique/identity}
         :address/network      {:db/valueType :db.type/ref}
         :address/pk           {:db/persist false}
         :address/token        {:db/cardinality :db.cardinality/many
                                :db/valueType   :db.type/ref}
         :address/tx           {:db/cardinality :db.cardinality/many
                                :db/isComponent true
                                :db/valueType   :db.type/ref}
         :app/account          {:db/cardinality :db.cardinality/many :db/valueType :db.type/ref}
         :app/currentAccount   {:db/valueType :db.type/ref}
         :app/currentNetwork   {:db/valueType :db.type/ref}
         :app/network          {:db/cardinality :db.cardinality/many :db/valueType :db.type/ref}
         :app/site             {:db/unique :db.unique/identity :db/valueType :db.type/ref}
         :app/tx               {:db/cardinality :db.cardinality/many :db/valueType :db.type/ref}
         :authReq/app          {:db/persist false :db/valueType :db.type/ref}
         :authReq/c            {:db/persist false}
         :authReq/req          {:db/persist false}
         :authReq/site         {:db/persist false :db/valueType :db.type/ref}
         :hdPath/name          {:db/unique :db.unique/identity}
         :hdPath/value         {:db/unique :db.unique/value}
         :network/endpoint     {:db/unique :db.unique/value}
         :network/hdPath       {:db/valueType :db.type/ref}
         :network/name         {:db/unique :db.unique/identity}
         :network/tokenList    {:db/isComponent true :db/valueType :db.type/ref}
         :site/origin          {:db/unique :db.unique/identity}
         :site/post            {:db/persist false}
         :token/balance        {:db/cardinality :db.cardinality/many
                                :db/isComponent true
                                :db/valueType   :db.type/ref}
         :token/id             {:db/tupleAttrs [:token/network :token/address]
                                :db/unique     :db.unique/identity}
         :token/network        {:db/valueType :db.type/ref}
         :token/tx             {:db/cardinality :db.cardinality/many :db/valueType :db.type/ref}
         :tokenList/token      {:db/cardinality :db.cardinality/many
                                :db/valueType   :db.type/ref}
         :tokenList/url        {:db/unique :db.unique/identity}
         :tx/hash              {:db/unique :db.unique/identity}
         :tx/txExtra           {:db/isComponent true :db/valueType :db.type/ref}
         :tx/txPayload         {:db/isComponent true :db/valueType :db.type/ref}
         :unlockReq/req        {:db/persist false}
         :vault/ddata          {:db/persist false}}

        txs        [(update-version-tx old-db id)]
        new-db     (d/db-with old-db txs)
        all-datoms (d/datoms new-db :eavt)
        new-db     (d/init-db all-datoms new-schema)]
    new-db))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})
