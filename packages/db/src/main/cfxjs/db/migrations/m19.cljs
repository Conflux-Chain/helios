(ns cfxjs.db.migrations.m19
(:require
    [cfxjs.db.datascript.core :as d]
    [cfxjs.db.migutil :refer [update-version-tx]]))

(def id 19)

(defn up [old-db]
(let [old-schema (d/schema old-db)
        new-schema (assoc old-schema
                        :address/userOperation
                        {:db/cardinality :db.cardinality/many
                            :db/valueType :db.type/ref
                            :db/isComponent true}
                        :userOperation/hash
                        {:db/unique :db.unique/identity})
        new-db (d/db-with old-db [(update-version-tx old-db id)])
        all-datoms (d/datoms new-db :eavt)]
    (d/init-db all-datoms new-schema)))

(defn down [new-db] new-db)

(def data {:up up :down down :id id})