(ns cfxjs.db.dev
  "namespace only used in dev env"
  (:require
   [cfxjs.db.datascript.core :as d]
   [cfxjs.db.core :refer [p q t e fdb conn]]))

(def accounts
  (q '[:find [(pull ?acc [*]) ...]
       :where [?acc :account/index _]]))
(def groups
  (q '[:find [(pull ?g [*]) ...]
       :where [?g :accountGroup/nickname _]]))

(def accounts-count (count accounts))
(def each-accounts-address-count
  (map #(count (:account/address %)) accounts))
(def each-accounts-address-id
  (map (fn [a]  [(:db/id a)
                 (count (:account/address a))
                 [(map :db/id (:account/address a))]]) accounts))
(defn get-accounts-structure
  [accs]
  {:c (count accs)
   :r (map
       (fn [a]
         {:eid         (:db/id a)
          :addrs-count (count (:account/address a))
          :address     (map :db/id (:account/address a))})
       accs)})
#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(def accounts-structure
  (get-accounts-structure accounts))

#_{:clj-kondo/ignore [:clojure-lsp/unused-public-var]}
(def group-structure
  {:c (count groups)
   :r (map
       (fn [g]
         {:eid       (:db/id g)
          :acc-count (count (:accountGroup/account g))
          :accs      (get-accounts-structure (:accountGroup/account g))})
       groups)})

(defn reload! []
  (js/chrome.storage.local.clear)
  (js/chrome.runtime.reload))

(defn l
  ([method] (l [method {}]))
  ([method params]
   (let [payload {:method method}
         payload (if params (assoc payload :params params) payload)]
     (->
      (js/r (clj->js payload))
      (.then js/console.log)
      (.catch js/console.error)))))

(comment
  (p '[:address/_account] 53)
  (p '[:address/_account] 54)
  (p '[*] 53)
  (p '[*] 54)
  (d/pull @conn [:account/_address] 52)
  (:account/_address (p '[{:account/_address [*]}] 52))
  (p '[:account/_address] 54)
  (reload!)
  (l "wallet_metadataForPopup" [])
  (l "walletdb_queryAccountList" {:networkId 6 :addressG {:value 1 :hex 1 :nativeBalance 1} :accountG {:nickname 1} :groupG {:vault {:type 1}}}))
