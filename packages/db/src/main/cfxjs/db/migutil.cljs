(ns cfxjs.db.migutil
  (:require
   [cfxjs.db.datascript.core :as d]))

(defn update-version-tx
  [db custom-id]
  {:db/id (d/q '[:find ?v .
                 :where [?v :dbmeta/version]]
               db)
   :dbmeta/version custom-id})
