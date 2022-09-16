(ns hooks.portal
  (:require
   [portal.api :as p]))

(defonce psession (atom nil))

(defn start
  ;; metadata 代表buld的某个阶段 见6.3
  ;; :configure means :target specific configuration
  {:shadow.build/stage :configure}
  [build-state & _]
  ;; (def x build-state)
  (let [;; build-id (:shadow.build/build-id build-state)
        mode     (:shadow.build/mode build-state)]
    (when (= mode :dev)
      (reset! psession (portal.api/open @psession {:port 9629 :app false})))
    build-state))
