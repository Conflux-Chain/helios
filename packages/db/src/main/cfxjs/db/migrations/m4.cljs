(ns cfxjs.db.migrations.m4
  (:require
   [clojure.string]
   [cfxjs.db.datascript.core :as d]))

(def id 4)

(defn- update-version-tx
  ([db] (update-version-tx db id))
  ([db custom-id]
   {:db/id (d/q '[:find ?v .
                  :where [?v :dbmeta/version]]
                db)
    :dbmeta/version custom-id}))

(defn up [old-db]
  (let [networks-with-wrong-scan-url
        (d/q '[:find [(pull ?net [:db/id :network/scanUrl]) ...]
               :where
               ;; only builtin network has scan url without protocol
               [?net :network/builtin true]
               [?net :network/scanUrl ?url]
               (not [(clojure.string/starts-with? ?url "http")])]
             old-db)
        update-scan-url-txs (map
                             (fn [n]
                               {:db/id           (:db/id n)
                                :network/scanUrl (str "https://" (:network/scanUrl n))})
                             networks-with-wrong-scan-url)
        new-db              (d/db-with old-db (conj update-scan-url-txs
                                                    (update-version-tx old-db)))]
    new-db))

(defn down [new-db]
  ;; no need to change the url back when migrate down
  (let [txs                     [(update-version-tx new-db (dec id))]
        old-db                  (d/db-with new-db txs)]
    old-db))

(def data {:up up :down down :id id})
