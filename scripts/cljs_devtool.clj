(ns cljs-devtool
  (:require
   [babashka.process :as p]))

(defmacro dark? []
  (= (slurp (:out (p/process '[defaults read -globalDomain AppleInterfaceStyle])))
     "Dark\n"))
