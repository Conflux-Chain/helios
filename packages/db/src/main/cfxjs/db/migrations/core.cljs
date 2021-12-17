(ns cfxjs.db.migrations.core
  (:require
   [cfxjs.db.migrations.m1]
   [cfxjs.db.migrations.m2]))

(def migrations [cfxjs.db.migrations.m1/data
                 cfxjs.db.migrations.m2/data])
