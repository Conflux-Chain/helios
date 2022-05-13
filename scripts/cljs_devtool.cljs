(ns cljs-devtool
  (:require-macros [cljs-devtool :refer [dark?]])
  (:require
   [devtools.core :as dvt]))

(let [{:keys [cljs-land-style]} (dvt/get-prefs)
      frontend?                 js/matchMedia
      frontend-dark?            (and frontend?  (.-matches (js/matchMedia "(prefers-color-scheme: dark)")))]
  (dvt/set-pref! :cljs-land-style
                 (if
                  (or frontend-dark? (and (not frontend?) (dark?)))
                   (str "filter:invert(1);" cljs-land-style)
                   cljs-land-style)))
(dvt/install!)
