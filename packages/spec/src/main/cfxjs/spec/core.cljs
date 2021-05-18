(ns cfxjs.spec.core
  (:require [malli.core :as m]
            [malli.util :as mu]
            [malli.error :refer [humanize]]
            [goog.math :refer [randomInt]]))

(defn j->c [a] (js->clj a :keywordize-keys true))

(defn explain [schema data]
  (let [rst (humanize (m/explain (j->c schema) (js->clj data)))]
    (clj->js rst)))

(defn validate [schema data]
  (let [s (j->c schema)
        d (js->clj data)
        rst (m/validate s d)]
    ;; (when (and goog.DEBUG (not rst))
    ;;   (js/console.error #js {:value data
    ;;                          :error (explain s d)}))
    rst))

(defn update-properties [schema & forms]
  (let [trans (partition 2 forms)
        [in v] (first trans)
        in (if (vector? in) in [in])
        ;; in (into [:type-properties] in)
        schema (mu/update-properties schema assoc-in in v)
        trans (flatten (rest trans))]
    (if (empty? trans) schema
        (apply update-properties schema trans))))

(defn def-rest-schemas [opts]
  (let [{:keys [INTERNAL_CONTRACTS_HEX_ADDRESS randomHexAddress randomPrivateKey validateMnemonic generateMnemonic validatePrivateKey validateHDPath randomHDPath]} (j->c opts)
        INTERNAL_CONTRACTS_HEX_ADDRESS (js->clj INTERNAL_CONTRACTS_HEX_ADDRESS)]
    #js
    {:hdPath (m/-simple-schema
                {:type :hd-path
                 :pred #(and (string? %) (validateHDPath %))
                 :type-properties {:error/message "should be a valid hdPath without the last address index"
                                   :doc "hd wallet derivation path without the last address_index, check https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#abstract for detail"
                                   :gen/fmap #(.call randomHDPath)}})
     :mnemonic (m/-simple-schema
                {:type :mnemonic
                 :pred #(and (string? %) (validateMnemonic %))
                 :type-properties {:error/message "should be a valid mnemonic"
                                   :doc "Mnemonic phrase"
                                   :gen/fmap #(.call generateMnemonic)}})
      :privateKey (m/-simple-schema
                   {:type :privateKey
                    :pred #(validatePrivateKey %)
                    :type-properties {:error/message "invalid private key" :doc "0x-prefixed private key"
                                      :gen/fmap #(.call randomPrivateKey)}})
      :ethHexAddress (update-properties
                      [:re #"^0x[0-9a-fA-F]{40}$"]
                      :gen/fmap #(.call randomHexAddress)
                      :error/message "invalid hex address"
                      :doc "0x-prefixed address")
      :hexUserAddress (update-properties
                       [:re #"^0x1[0-9a-fA-F]{39}$"]
                       :type :hexUserAddress
                       :gen/fmap #(.call randomHexAddress nil "user")
                       :error/message "invalid hex user address"
                       :doc "Conflux hex user address")
      :hexContractAddress (update-properties
                           [:re #"^0x8[0-9a-fA-F]{39}$"]
                           :type :hexContractAddress
                           :error/message "invalid hex contract address"
                           :doc "Conflux hex user address"
                           :gen/fmap #(.call randomHexAddress nil "contract"))
      :hexBuiltInAddress (update-properties
                          (into [:enum] INTERNAL_CONTRACTS_HEX_ADDRESS)
                          :type :hexBuiltInAddress
                          :error/message (str "invalid hex builtin address, can only be one of " INTERNAL_CONTRACTS_HEX_ADDRESS)
                          :doc "Hex address of conflux internal contract, can be found at https://confluxscan.io/contracts"
                          :gen/elements INTERNAL_CONTRACTS_HEX_ADDRESS)
      :hexNullAddress (update-properties
                       [:= "0x0000000000000000000000000000000000000000"]
                       :type :hexNullAddress
                       :doc "Null address: 0x0000000000000000000000000000000000000000"
                       :error/message "invalid hex null address, should be 0x0000000000000000000000000000000000000000")}))

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
       :type-properties {:error/message "invalid base32 address"
                         :doc (str "Conflux base32 address with '" address-type "' type and networkId is " network-id)
                         :gen/fmap #(.call gen nil network-id address-type)}}))))

(def Password (update-properties [:string {:min 8 :max 128}]
                                 :doc "String between 8 to 128 character" :type :password))
(def NetworkId (update-properties [:and :int [:>= 0] [:<= 4294967295]]
                                  :type :network-id :doc "1029 for mainnet, 1 for testnet, 0 <= networkId <= 4294967295"))
(def AddressType (update-properties [:enum "user" "contract" "builtin" "null"]
                                    :type :address-type :doc "Is string, one of user contract builtin null"))

(comment
  (#(re-matches #"^0x[0-9a-fA-F]{40}$" %) "0x0000000000000000000000000000000000000000")
  (m/validate #(re-matches #"^0x[0-9a-fA-F]{40}$" %) "0x0000000000000000000000000000000000000000")
  (m/validate int? 1)
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
(def export-nil (m/-simple-schema
                 {:type :nil
                  :pred nil?
                  :type-properties {:error/message "should be null or cljs nil"
                                    :doc "javascript null or cljs nil"
                                    :gen/fmap (fn [& args] nil)}}))
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
(def export-networkId NetworkId)
(def export-addressType AddressType)
(def export-hex-string (update-properties
                        [:re #"^0(x|X)?[a-fA-F0-9]+$"]
                        :type :hexString
                        :gen/fmap #(str "0x"
                                        (-> js/Number.MAX_SAFE_INTEGER randomInt (.toString 16)))
                        :error/message "invalid hex string"
                        :doc "hexadecimal string"))
(def export-js-undefined
  (m/-simple-schema
   {:type :undefined
    :pred #(= js/undefined)
    :type-properties {:error/message "should be undefined"
                      :doc "javascript undefined"
                      :gen/fmap (fn [& args] js/undefined)}}))
(def export-epoch-tag
  (update-properties
   [:or [:enum "latest_mined" "latest_confirmed" "latest_state" "latest_checkpoint" "earliest" nil] export-hex-string]
   :type :epoch-tag
   :error/message "invalid epoch tag, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"
   :doc "epoch number tag, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"))
;; (def export-tap tap>)
