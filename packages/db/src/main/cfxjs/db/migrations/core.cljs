(ns cfxjs.db.migrations.core
  (:require
   [cfxjs.db.migrations.m1]
   [cfxjs.db.migrations.m2]
   [cfxjs.db.migrations.m3]
   [cfxjs.db.migrations.m4]
   [cfxjs.db.migrations.m5]))

(def migrations [cfxjs.db.migrations.m1/data
                 cfxjs.db.migrations.m2/data
                 cfxjs.db.migrations.m3/data
                 cfxjs.db.migrations.m4/data
                 cfxjs.db.migrations.m5/data])
