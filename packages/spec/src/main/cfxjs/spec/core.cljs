(ns cfxjs.spec.core
  (:require [malli.core :as m]))

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
  (let [rst (m/explain (j->c schema) (js->clj data))]
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
                          :pred #(re-matches #"^0x8[0-9a-fA-F]{39}$" %)
                          :type-properties {:error/message "invalid hex account address, should be start with 0x1"}
                          :gen/gen (comp randomHexAddress #(.replace % #"0x\d" "0x1"))})
     :hexContractAddress (m/-simple-schema
                          {:type :hexContractAddress
                           :pred #(re-matches #"^0x0[0-9a-fA-F]{39}$" %)
                           :type-properties {:error/message "invalid hex contract address, should be start with 0x8"}
                           :gen/gen (comp randomHexAddress #(.replace % #"0x\d" "0x8"))})}))

(defn def-base32-address-schema
  ([pred gen network-id-or-type] (def-base32-address-schema pred gen network-id-or-type nil))
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
(def exports
  #js
   {;; factory for schemas that needs helper functions from js side
    :defRestSchemas def-rest-schemas
    :defBase32AddressSchema def-base32-address-schema
    ;; pred schemas
    :anyp any?
    :some some?
    :number number?
    :integer integer?
    :intp int?
    :posInt pos-int?
    :negInt neg-int?
    :natInt nat-int?
    :pos pos?
    :neg neg?
    :float float?
    :doublep double?
    :booleanp boolean?
    :stringp string?
    :ident ident?
    :simpleIdent simple-ident?
    :qualifiedIdent qualified-ident?
    :keywordp keyword?
               ;; :simple-keyword simple-keyword?
               ;; :qualified-keyword qualified-keyword?
    :symbolp symbol?
               ;; :simple-symbol simple-symbol?
               ;; :qualified-symbol qualified-symbol?
    :uuidp uuid?
    :uri uri?
    :inst inst?
    :seqable seqable?
    :indexed indexed?
    :mapp map?
    :objp map?
    :vectorp vector?
    :list list?
    :seq seq?
    :char char?
    :setp set?
    :nil nil?
    :falsep false?
    :truep true?
    :zero zero?
    :coll coll?
    :empty empty?
    :associative associative?
    :sequentialp sequential?

               ;; class schemas
    :regexp js/RegExp

               ;; comparator schemas
    :gt :>
    :gte :>=
    :lt :<
    :lte :<=
    :eq :=
    :neq :not=

               ;; type schemas
    :any :any
    :string :string
    :int :int
    :double :double
    :boolean :boolean
    :keyword :keyword
    :symbol :symbol
    :uuid :uuid
    :qualifiedSymbol :qualified-symbol
    :qualifiedKeyword :qualified-keyword

               ;; sequence schemas
    :oneOrMore :+
    :plus :+
    :zeroOrMore :*
    :asterisk :*
    :zeroOrOne :?
    :questionMark :?
    :repeat :repeat
    :cat :cat
    :alt :alt
    :catn :catn
    :altn :altn

               ;; base schemas
    :and :and
    :or :or
    :orn :orn
    :not :not
    :map :map
    :closed {:closed true}
    :optional {:optional true}
    :obj :map
    :vector :vector
    :arr :vector
    :sequential :sequential
    :set :set
    :enum :enum
    :maybe :maybe
    :tuple :tuple
    :multi :multi
    :re :re
    :fn :fn
    :ref :ref
    :function :function
    :schema :schema
    :mapOf :map-of
    :objOf :map-of
    :f :=>
    :raw-schema ::schema

    :validate validate
    :explain explain
    ;; :object (partial object-of {:closed false})
    ;; :objectc (partial object-of {:closed true})
    ;; :arrayOf array-of
    :k keyword

    :password Password
    ;; :tap tap>
    })
