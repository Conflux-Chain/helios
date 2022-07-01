(ns x.portal.setup
  (:require
   [cljs-time.coerce :as tc]
   [cljs-time.core :as t]
   [cljs-time.format :as tf]
   [lambdaisland.glogi :as glogi]
   [lambdaisland.glogi.console :as glogic]
   [portal.client.web :as c]
   [portal.web :as p]
   [taoensso.encore :as enc]))

(glogic/install!)

(defn- ignore-error? [{:keys [cause]}]
  (when (string? cause)
    (cond
      (.includes cause "debug-evaluate")
      true
      (.includes cause "Invalid or unexpected token")
      true
      :else false)))

(defn- submit [value]
  (when-not (ignore-error? value)
    (p/submit value)
    (c/submit {:port 9629} value)))

(defn- error->data [ex]
  (merge
   (when-let [data (.-data ex)]
     {:data data})
   {:runtime :portal
    :cause   (.-message ex)
    :via     [{:type    (symbol (.-name (type ex)))
               :message (.-message ex)}]
    :stack   (.-stack ex)}))

(defn- async-submit [value]
  (cond
    (instance? js/Promise value)
    (-> value
        (.then async-submit)
        (.catch (fn [error]
                  (async-submit error)
                  (throw error))))

    (instance? js/Error value)
    (submit (error->data value))

    :else
    (submit value)))

(add-tap #'async-submit)

(defn- error-handler [event]
  (tap> (or (.-error event) (.-reason event))))

(defn- parse-time [t]
  (try
    (tf/unparse-local (tf/formatter-local "MM/dd HH:mm:ss") (t/to-default-time-zone (tc/from-long t)))
    (catch js/Error _ t)))

(defn glogi-format [{:keys [time level message logger-name exception] :as x}]
  (async-submit
   (-> message
       (enc/assoc-some
        :level level
        :ns logger-name
        :exception exception
        :time (parse-time time))
       (dissoc :spy)))
  nil)

(defonce console-portal (glogic/make-console-log glogi-format))
(glogi/add-handler-once console-portal)

(.addEventListener js/window "error" error-handler)
(.addEventListener js/window "unhandledrejection" error-handler)
