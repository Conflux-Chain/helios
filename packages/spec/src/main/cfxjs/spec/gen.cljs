(ns cfxjs.spec.gen
  (:require [malli.generator :as mg]))

(defn gen [schema] (clj->js (mg/generate (js->clj schema))))

(comment
  (def s (js->clj (.-a js/window) :keywordize-keys true))
  (def s (.-a js/window))
  (gen s))
