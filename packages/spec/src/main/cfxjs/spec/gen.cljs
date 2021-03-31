(ns cfxjs.spec.gen
  (:require [malli.generator :as mg]))

(defn gen [schema] (clj->js (mg/generate (js->clj schema))))
