(ns cfxjs.db.dev
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.core :refer [p q t e fdb conn]]))

(def accounts
  (q '[:find [(pull ?acc [*]) ...]
       :where [?acc :account/index _]]))

(def accounts-count (count accounts))
(def each-accounts-address-count
  (map #(count (:account/address %)) accounts))

(defn reload! []
  (js/chrome.storage.local.clear)
  (js/chrome.runtime.reload))

(comment
  (reload!))
