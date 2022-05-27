(ns cfxjs.db.migrations.core
  (:require
   [cfxjs.db.migrations.m1]
   [cfxjs.db.migrations.m2]
   [cfxjs.db.migrations.m3]
   [cfxjs.db.migrations.m4]
   [cfxjs.db.migrations.m5]
   [cfxjs.db.migrations.m6]
   [cfxjs.db.migrations.m7]
   [cfxjs.db.migrations.m8]
   [cfxjs.db.migrations.m9]
   [cfxjs.db.migrations.m10]
   [cfxjs.db.migrations.m11]))

(def migrations [cfxjs.db.migrations.m1/data
                 cfxjs.db.migrations.m2/data
                 cfxjs.db.migrations.m3/data
                 cfxjs.db.migrations.m4/data
                 cfxjs.db.migrations.m5/data
                 cfxjs.db.migrations.m6/data
                 cfxjs.db.migrations.m7/data
                 cfxjs.db.migrations.m8/data
                 cfxjs.db.migrations.m9/data
                 cfxjs.db.migrations.m10/data
                 cfxjs.db.migrations.m11/data])
