(ns cfxjs.spec.core
  (:require [malli.core :as m]
            [malli.error :refer [humanize]]))

(defn j->c [a] (js->clj a :keywordize-keys true))

;; (defn object-of [opt schema]
;;   (let [{:keys [closed]} opt
;;         prefix (if closed [:map {:closed true}] [:map])
;;         schema (into prefix (j->c schema))]
;;     (prn schema)
;;     schema))

;; (defn array-of [schema]
;;   (let [schema (into [:vector] (j->c schema))] schema))

(defn validate [schema data]
  (m/validate (j->c schema) (js->clj data)))

(defn explain [schema data]
  (let [rst (humanize (m/explain (j->c schema) (js->clj data)))]
    (clj->js rst)))

(defn def-rest-schemas [opts]
  (let [{:keys [randomHexAddress randomPrivateKey validateMnemonic generateMnemonic validatePrivateKey]} (j->c opts)]
    #js
    {:mnemonic (m/-simple-schema
                {:type :mnemonic
                 :pred #(and (string? %) (validateMnemonic %))
                 :type-properties {:error/message "should be a valid mnemonic"}
                 :gen/gen generateMnemonic})
     :privateKey (m/-simple-schema
                  {:type :privateKey
                   :pred #(validatePrivateKey %)
                   :type-properties {:error/message "invalid private key"}
                   :gen/gen randomPrivateKey})
     :hexAddress (m/-simple-schema
                  {:type :hexAddress
                   :pred #(re-matches #"^0x[0-9a-fA-F]{40}$" %)
                   :type-properties {:error/message "invalid hex address"}
                   :gen/gen randomHexAddress})
     :hexAccountAddress (m/-simple-schema
                         {:type :hexAccountAddress
                          :pred #(re-matches #"^0x1[0-9a-fA-F]{39}$" %)
                          :type-properties {:error/message "invalid hex account address, should be start with 0x1"}
                          :gen/gen (comp randomHexAddress #(.replace % #"0x\d" "0x1"))})
     :hexContractAddress (m/-simple-schema
                          {:type :hexContractAddress
                           :pred #(re-matches #"^0x8[0-9a-fA-F]{39}$" %)
                           :type-properties {:error/message "invalid hex contract address, should be start with 0x8"}
                           :gen/gen (comp randomHexAddress #(.replace % #"0x\d" "0x8"))})
     :hexBuiltInAddress (m/-simple-schema
                         {:type :hexBuiltinAddress
                          :pred #(re-matches #"^0x0[0-9a-fA-F]{39}$" %)
                          :type-properties {:error/message "invalid hex builtin address, should be start with 0x0"}
                          :gen/gen (comp randomHexAddress #(.replace % #"0x\d" "0x0"))})}))

(defn def-base32-address-schema-factory
  ([pred gen network-id-or-type] (def-base32-address-schema-factory pred gen network-id-or-type nil))
  ([pred gen network-id-or-type-1 network-id-or-type-2]
   (let [network-id (cond (number? network-id-or-type-1) network-id-or-type-1
                          (number? network-id-or-type-2) network-id-or-type-2
                          :else nil)
         address-type (cond (string? network-id-or-type-1) network-id-or-type-1
                            (string? network-id-or-type-2) network-id-or-type-2
                            :else nil)
         network-id-str (if network-id (str "-" (.toString network-id)) "")
         address-type-str (if address-type (str "-" address-type) "")
         type (keyword (str "base32Address" network-id-str address-type-str))]
     (m/-simple-schema
      {:type type
       :pred #(pred % address-type network-id)
       :type-properties {:error/message "invalid base32 address"}
       :gen/gen #(gen network-id address-type)}))))

(def Password [:string {:min 8 :max 128}])

(comment
  (m/validate [:? int?] 1)
  (m/validate [:maybe string?] nil))

;; factory for schemas that needs helper functions from js side
(def export-defRestSchemas def-rest-schemas)
(def export-defBase32AddressSchemaFactory def-base32-address-schema-factory)
;; pred schemas
(def export-anyp any?)
(def export-some some?)
(def export-number number?)
(def export-integer integer?)
(def export-intp int?)
(def export-posInt pos-int?)
(def export-negInt neg-int?)
(def export-natInt nat-int?)
(def export-pos pos?)
(def export-neg neg?)
(def export-float float?)
(def export-doublep double?)
(def export-booleanp boolean?)
(def export-stringp string?)
(def export-ident ident?)
(def export-simpleIdent simple-ident?)
(def export-qualifiedIdent qualified-ident?)
(def export-keywordp keyword?)
;; (def export-simple-keyword simple-keyword?)
;; (def export-qualified-keyword qualified-keyword?)
(def export-symbolp symbol?)
;; (def export-simple-symbol simple-symbol?)
;; (def export-qualified-symbol qualified-symbol?)
(def export-uuidp uuid?)
(def export-uri uri?)
(def export-inst inst?)
(def export-seqable seqable?)
(def export-indexed indexed?)
(def export-mapp map?)
(def export-objp map?)
(def export-vectorp vector?)
(def export-list list?)
(def export-seq seq?)
(def export-char char?)
(def export-setp set?)
(def export-nil nil?)
(def export-falsep false?)
(def export-truep true?)
(def export-zero zero?)
(def export-coll coll?)
(def export-empty empty?)
(def export-associative associative?)
(def export-sequentialp sequential?)

;; class schemas
(def export-regexp js/RegExp)

;; comparator schemas
(def export-gt :>)
(def export-gte :>=)
(def export-lt :<)
(def export-lte :<=)
(def export-eq :=)
(def export-neq :not=)

;; type schemas
(def export-any :any)
(def export-string :string)
(def export-int :int)
(def export-double :double)
(def export-boolean :boolean)
(def export-keyword :keyword)
(def export-symbol :symbol)
(def export-uuid :uuid)
(def export-qualifiedSymbol :qualified-symbol)
(def export-qualifiedKeyword :qualified-keyword)

;; sequence schemas
(def export-oneOrMore :+)
(def export-plus :+)
(def export-zeroOrMore :*)
(def export-asterisk :*)
(def export-zeroOrOne :?)
(def export-questionMark :?)
(def export-repeat :repeat)
(def export-cat :cat)
(def export-alt :alt)
(def export-catn :catn)
(def export-altn :altn)

;; base schemas
(def export-and :and)
(def export-or :or)
(def export-orn :orn)
(def export-not :not)
(def export-map :map)
(def export-closed {:closed true})
(def export-optional {:optional true})
(def export-obj :map)
(def export-vector :vector)
(def export-arr :vector)
(def export-sequential :sequential)
(def export-set :set)
(def export-enum :enum)
(def export-maybe :maybe)
(def export-tuple :tuple)
(def export-multi :multi)
(def export-re :re)
(def export-fn :fn)
(def export-ref :ref)
(def export-function :function)
(def export-schema :schema)
(def export-mapOf :map-of)
(def export-objOf :map-of)
(def export-f :=>)
(def export-raw-schema ::schema)

(def export-validate validate)
(def export-explain explain)
;; (def export-object (partial object-of {:closed false}))
;; (def export-objectc (partial object-of {:closed true}))
;; (def export-arrayOf array-of)
(def export-k keyword)

(def export-password Password)
;; (def export-tap tap>)
