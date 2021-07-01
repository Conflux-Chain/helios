(ns cfxjs.db.queries
  (:require
   [cfxjs.db.schema :refer [model->attr-keys]]))

(declare q e)

(def queries {:getOneAccountByGroupAndNickname (fn [{:keys [groupId nickname]}]
                                                 (e :account
                                                    (first (q '[:find [?e ...]
                                                                :in $ ?gid ?eqnick
                                                                :where
                                                                [?g :accountGroup/account]
                                                                [(= ?gid ?g)]
                                                                [?g :accountGroup/account ?e]
                                                                [?e :account/nickname ?nick]
                                                                [(?eqnick ?nick)]]
                                                              groupId #(or (not nickname) (= % nickname))))))
              :getOneAccountByGroupAndIndex    (fn [{:keys [groupId index]}]
                                                 (e :account
                                                    (first (q '[:find [?e ...]
                                                                :in $ ?gid ?idx
                                                                :where
                                                                [?g :accountGroup/account]
                                                                [(= ?g ?gid)]
                                                                [?g :accountGroup/account ?e]
                                                                [?e :account/index ?idx]] groupId index))))
              :getAddressNetwork               (fn [addr-id]
                                                 (e :network (first (q '[:find [?n ...]
                                                                         :in $ ?aid
                                                                         :where
                                                                         [?n :network/address ?aid]] addr-id))))
              :getAccountAccountGroup          (fn [account-id]
                                                 (e :accountGroup (first (q '[:find [?g ...]
                                                                              :in $ ?aid
                                                                              :where
                                                                              [?g :accountGroup/account ?aid]] account-id))))
              :anyDupNickAccount               (fn [{:keys [accountId nickname]}]
                                                 (boolean (first (q '[:find [?as ...]
                                                                      :in $ ?aid ?to-check-nick
                                                                      :where
                                                                      [?g :accountGroup/account ?aid]
                                                                      [?g :accountGroup/account ?as]
                                                                      [?as :account/nickname ?to-check-nick]]
                                                                    accountId nickname))))
              :filterAccountGroupByNetworkType (fn [network-type]
                                                    (map #(e :accountGroup %) (if (= network-type "eth")
                                                                                ;; accountGroup without vault with
                                                                                ;; network-type "pub", cfxOnly true
                                                                                (q '[:find [?g ...]
                                                                                     :where
                                                                                     [?g :accountGroup/vault ?v]
                                                                                     [?v :vault/cfxOnly ?cfxOnly]
                                                                                     [?v :vault/type ?vtype]
                                                                                     (not [?v :vault/cfxOnly true]
                                                                                          [?v :vault/type "pub"])])
                                                                                ;; all accountGroup
                                                                                (q '[:find [?g ...]
                                                                                     :where
                                                                                     [?g :accountGroup/vault]]))))})

(defn apply-queries [conn qfn entity]
  (def q qfn)
  (def e (fn [model eid] (entity model (model->attr-keys model) eid)))
  (reduce-kv
   (fn
     [acc k v]
     (if
      (get acc k)
       acc
       (assoc acc k
              (comp clj->js v #(js->clj % :keywordize-keys true)))))
   conn
   queries))
