(ns ^:no-doc cfxjs.db.datascript.impl.entity
  (:refer-clojure :exclude [keys get])
  (:require [#?(:cljs cljs.core :clj clojure.core) :as c]
            [cfxjs.db.datascript.db :as db]
            [cfxjs.db.schema :as dcs]))

(declare entity ->Entity equiv-entity lookup-entity touch)

(defn- entid [db eid]
  (when (or (number? eid)
            (sequential? eid)
            (keyword? eid))
    (db/entid db eid)))

(defn entity [db model & [attr-keys eid]]
  {:pre [(db/db? db)]}
  (when-let [e (entid db eid)]
    (let [e (->Entity db model attr-keys e (volatile! false) (volatile! {}))]
      (doseq [attr attr-keys]
        (let [attr (name attr)]
          (doto e
            (js/Object.defineProperty attr
                                      #js {:get #(this-as t (clj->js (.get t attr)))}))))
      e)))

(defn- entity-attr [db a datoms]
  (let [ref? (db/ref? db a)
        model (when ref? (dcs/ref-qattr->model a))
        attr-keys (when ref? (dcs/model->attr-keys model))]
    (if (db/multival? db a)
      (if ref?
        (reduce #(conj %1 (entity db model attr-keys (:v %2))) #{} datoms)
        (reduce #(conj %1 (:v %2)) #{} datoms))
      (if ref?
        (entity db model attr-keys (:v (first datoms)))
        (:v (first datoms))))))

(defn- -lookup-backwards [db eid attr not-found]
  (if-let [datoms (not-empty (db/-search db [nil attr eid]))]
    (let [model (dcs/qattr->model attr)
          attr-keys (dcs/qattr->attr-keys attr)]
      (if (db/component? db attr)
        (entity db model attr-keys (:e (first datoms)))
        (reduce #(conj % 1 (entity db model attr-keys (:e % 2))) #{} datoms)))
    not-found))

#?(:cljs
   (defn- multival->js [val]
     (when val (to-array val))))

#?(:cljs
   (defn- js-seq [e]
     (touch e)
     (for [[a v] @(.-cache e)]
       (if (db/multival? (.-db e) a)
         [a (multival->js v)]
         [a v]))))

(deftype Entity [db model attr-keys eid touched cache]
  #?@(:cljs
      [Object
       (modelName [_] (name model))
       (attrToKey [this attr]
                  (cond (keyword? attr) attr
                        (string? attr) (if (.startsWith attr ":")
                                         (keyword (subs attr 1))
                                         (keyword (.modelName this) attr))
                        :else attr))
       (toString [this include-persist?]
                 (js/JSON.stringify (.toJSON this include-persist?)))
       (toMap [this include-persist?]
              (let [json (reduce (fn [acc k]
                                   (let [attr (keyword model k)]
                                     (if (and (not include-persist?) (db/mem-only? db attr))
                                       acc
                                       (assoc acc k (.get this (keyword model k))))))
                                 {} attr-keys)
                    json (assoc json :eid eid)]
                json))
       (toJSON [this include-persist?]
               (clj->js (.toMap this include-persist?)))
       (equiv [this other]
              (equiv-entity this other))

       ;; js/map interface
       (keys [this]
             (es6-iterator (c/keys this)))
       (entries [this]
                (es6-entries-iterator (js-seq this)))
       (values [this]
               (es6-iterator (map second (js-seq this))))
       (has [this attr]
            (not (nil? (.get this attr))))
       (get [this attr]
            (let [attr (.attrToKey this attr)]
              (if (= attr :db/id)
                eid
                (if (db/reverse-ref? attr)
                  (-> (-lookup-backwards db eid (db/reverse-ref attr) nil)
                      multival->js)
                  (cond-> (lookup-entity this attr)
                    (db/multival? db attr) multival->js)))))
       (touch [this]
              (touch this))
       (forEach [this f]
                (doseq [[a v] (js-seq this)]
                  (f v a this)))
       (forEach [this f use-as-this]
                (doseq [[a v] (js-seq this)]
                  (.call f use-as-this v a this)))

       ;; js fallbacks
       (key_set   [this] (to-array (c/keys this)))
       (entry_set [this] (to-array (map to-array (js-seq this))))
       (value_set [this] (to-array (map second (js-seq this))))

       IEquiv
       (-equiv [this o] (equiv-entity this o))

       IHash
       (-hash [_]
              (hash eid)) ;; db?

       ISeqable
       (-seq [this]
             (touch this)
             (seq @cache))

       ICounted
       (-count [this]
               (touch this)
               (count @cache))

       ILookup
       (-lookup [this attr]           (lookup-entity this attr nil))
       (-lookup [this attr not-found] (lookup-entity this attr not-found))

       IAssociative
       (-contains-key? [this k]
                       (not= ::nf (lookup-entity this k ::nf)))

       IFn
       (-invoke [this k]
                (lookup-entity this k))
       (-invoke [this k not-found]
                (lookup-entity this k not-found))

       IPrintWithWriter
       (-pr-writer [_ writer opts]
                   (-pr-writer (assoc @cache :db/id eid) writer opts))]

      :clj
      [Object
       (toString [e]      (pr-str (assoc @cache :db/id eid)))
       (hashCode [e]      (hash eid)) ; db?
       (equals [e o]      (equiv-entity e o))

       clojure.lang.Seqable
       (seq [e]           (touch e) (seq @cache))

       clojure.lang.Associative
       (equiv [e o]       (equiv-entity e o))
       (containsKey [e k] (not= ::nf (lookup-entity e k ::nf)))
       (entryAt [e k]     (some->> (lookup-entity e k) (clojure.lang.MapEntry. k)))

       (empty [e]         (throw (UnsupportedOperationException.)))
       (assoc [e k v]     (throw (UnsupportedOperationException.)))
       (cons  [e [k v]]   (throw (UnsupportedOperationException.)))
       (count [e]         (touch e) (count @(.-cache e)))

       clojure.lang.ILookup
       (valAt [e k]       (lookup-entity e k))
       (valAt [e k not-found] (lookup-entity e k not-found))

       clojure.lang.IFn
       (invoke [e k]      (lookup-entity e k))
       (invoke [e k not-found] (lookup-entity e k not-found))]))

(defn entity? [x] (instance? Entity x))

#?(:clj
   (defmethod print-method Entity [e, ^java.io.Writer w]
     (.write w (str e))))

(defn- equiv-entity [^Entity this that]
  (and
   (instance? Entity that)
   ;; (= db  (.-db ^Entity that))
   (= (.-eid this) (.-eid ^Entity that))))

(defn- lookup-entity
  ([this attr] (lookup-entity this attr nil))
  ([^Entity this attr not-found]
   (if (= attr :db/id)
     (.-eid this)
     (if (db/reverse-ref? attr)
       (-lookup-backwards (.-db this) (.-eid this) (db/reverse-ref attr) not-found)
       (if-some [v (@(.-cache this) attr)]
         v
         (if @(.-touched this)
           not-found
           (if-some [datoms (not-empty (db/-search (.-db this) [(.-eid this) attr]))]
             (let [value (entity-attr (.-db this) attr datoms)]
               (vreset! (.-cache this) (assoc @(.-cache this) attr value))
               value)
             not-found)))))))

(defn touch-components [db a->v]
  (reduce-kv (fn [acc a v]
               (assoc acc a
                      (if (db/component? db a)
                        (if (db/multival? db a)
                          (set (map touch v))
                          (touch v))
                        v)))
             {} a->v))

(defn- datoms->cache [db datoms]
  (reduce (fn [acc part]
            (let [a (:a (first part))]
              (assoc acc a (entity-attr db a part))))
          {} (partition-by :a datoms)))

(defn touch [^Entity e]
  {:pre [(entity? e)]}
  (when-not @(.-touched e)
    (when-let [datoms (not-empty (db/-search (.-db e) [(.-eid e)]))]
      (vreset! (.-cache e) (->> datoms
                                (datoms->cache (.-db e))
                                (touch-components (.-db e))))
      (vreset! (.-touched e) true)))
  e)

#?(:cljs (goog/exportSymbol "cfxjs.db.impl.entity.Entity" Entity))

(comment
  {:vault/accounts #{{:account/hexAddress "c"
                      :account/vault {:vault/accounts #{{:account/hexAddress "c"
                                                         :account/vault #:db{:id 1}
                                                         :db/id 2}}
                                      :vault/data "b"
                                      :vault/type "a"
                                      :db/id 1}
                      :db/id 2}}
   :vault/data "b"
   :vault/type "a"
   :db/id 1}
  (.get (goog.object.get js/globalThis.a "vault") "data"))
