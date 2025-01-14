(ns cfxjs.spec.core
  (:require [malli.core :as m]
            [malli.util :as mu]
            [malli.error :refer [humanize]]
            [clojure.walk :refer [postwalk]]
            [oops.core :refer [ocall]]
            [cfxjs.spec.cljs]
            [goog.math :refer [randomInt]]))

(defn j->c [a] (cfxjs.spec.cljs/js->clj a :keywordize-keys true))

(declare base32-address)
(declare base32-user-address)
(declare base32-contract-address)
(declare base32-builtin-address)
(declare base32-null-address)
(declare base32-schemas)

(defn- inject-netId-to-base32-schemas [netId s]
  (if (some #{s} base32-schemas) [s {:netId netId}] s))

(defn- pre-process-schema
  ([s] (pre-process-schema s {}))
  ([s opt]
   (let [s (j->c s)]
     (if-let [netId (get opt :netId)]
       (postwalk (partial inject-netId-to-base32-schemas netId) s)
       s))))

(defn validate
  ([schema] (validate schema js/undefined {}))
  ([schema data] (validate schema data {}))
  ([schema data opt]
   (let [opt (j->c opt)
         s ((memoize pre-process-schema) schema opt)
         d (cfxjs.spec.cljs/js->clj data)]
     (m/validate s d opt))))

(defn explain
  ([schema data] (explain schema data {}))
  ([schema data opt]
   (let [opt (j->c opt)
         s ((memoize pre-process-schema) schema opt)
         exp (m/explain s (cfxjs.spec.cljs/js->clj data) opt)
         rst (humanize exp)]
     ;; (when goog.DEBUG #p exp)
     (clj->js rst))))

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
  (let [{:keys [INTERNAL_CONTRACTS_HEX_ADDRESS isChecksummed randomHexAddress randomPrivateKey validateMnemonic generateMnemonic validatePrivateKey validateHDPath randomHDPath]} (j->c opts)
        INTERNAL_CONTRACTS_HEX_ADDRESS                                                                                                                                            (cfxjs.spec.cljs/js->clj INTERNAL_CONTRACTS_HEX_ADDRESS)]
    #js
     {:hdPath             (m/-simple-schema
                           {:type            :hd-path
                            :pred            #(and (string? %) (validateHDPath %))
                            :type-properties {:error/message "should be a valid hdPath without the last address index"
                                              :doc           "hd wallet derivation path without the last address_index, check https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#abstract for detail"
                                              :gen/fmap      #(.call randomHDPath)}})
      :mnemonic           (m/-simple-schema
                           {:type            :mnemonic
                            :pred            #(and (string? %) (validateMnemonic %))
                            :type-properties {:error/message "should be a valid mnemonic"
                                              :doc           "Mnemonic phrase"
                                              :gen/fmap      #(.call generateMnemonic)}})
      :privateKey         (m/-simple-schema
                           {:type            :privateKey
                            :pred            #(validatePrivateKey %)
                            :type-properties {:error/message "invalid private key" :doc "0x-prefixed private key"
                                              :gen/fmap      #(.call randomPrivateKey)}})
      :ethHexAddress      (m/-simple-schema
                           {:type            :ethHexAddress
                            :pred            (fn [addr]
                                               (when (string? addr)
                                                 (let [lower (.toLowerCase addr)
                                                       upper (.toUpperCase addr)]
                                                   (case addr
                                                     lower true
                                                     upper true
                                                     (isChecksummed addr)))))
                            :type-properties {:error/message "invalid hex address, should match regex ^0x[0-9a-fA-F]{40}$ and should be valid checksum address if is mixed case"
                                              :doc           "0x-prefixed address, checksummed or single case address"
                                              :gen/fmap      #(randomHexAddress nil true)}})
      :hexUserAddress     (update-properties
                           [:re #"^0x1[0-9a-fA-F]{39}$"]
                           :type :hexUserAddress
                           :gen/fmap #(randomHexAddress "user")
                           :error/message "invalid hex user address, should match regex #^0x1[0-9a-fA-F]{39}$"
                           :doc "Conflux hex user address")
      :hexContractAddress (update-properties
                           [:re #"^0x8[0-9a-fA-F]{39}$"]
                           :type :hexContractAddress
                           :error/message "invalid hex contract address, should match regex #^0x8[0-9a-fA-F]{39}$"
                           :doc "Conflux hex user address"
                           :gen/fmap #(randomHexAddress "contract"))
      :hexBuiltInAddress  (update-properties
                           (into [:enum] INTERNAL_CONTRACTS_HEX_ADDRESS)
                           :type :hexBuiltInAddress
                           :error/message (str "invalid hex builtin address, can only be one of " INTERNAL_CONTRACTS_HEX_ADDRESS)
                           :doc "Hex address of conflux internal contract, can be found at https://confluxscan.io/contracts"
                           :gen/elements INTERNAL_CONTRACTS_HEX_ADDRESS)
      :hexNullAddress     (update-properties
                           [:= "0x0000000000000000000000000000000000000000"]
                           :type :hexNullAddress
                           :doc "Null address: 0x0000000000000000000000000000000000000000"
                           :error/message "invalid hex null address, should be 0x0000000000000000000000000000000000000000")}))

(defn- base32-address-schema-type [address-type netId]
  (keyword
   (str "base32"
        (if address-type
          (str "-" (if netId (str address-type "-" netId) (str address-type)))
          (if netId (str "-" netId) ""))
        "-address")))

(defn def-base32-address-schema-factory [pred gen]
  (def base32-address (m/-simple-schema
                       (fn [{:keys [netId]} _]
                         {:type (base32-address-schema-type nil netId)
                          :pred #(pred % netId)
                          :type-properties {:error/message (str "Invalid base32 address" (if netId (str ", with network id " netId) ""))
                                            :doc (str "Base32 address" (if netId (str ", with network id " netId) ""))
                                            :gen/fmap #(.call gen nil netId)}})))
  (def base32-user-address
    (m/-simple-schema
     (fn [{:keys [netId]} _]
       {:type (base32-address-schema-type "user" netId)
        :pred #(pred % "user" netId)
        :type-properties {:error/message (str "Invalid base32 user address" (if netId (str ", with network id " netId) ""))
                          :doc (str "Base32 user address" (if netId (str ", with network id " netId) ""))
                          :gen/fmap #(.call gen nil netId)}})))
  (def base32-contract-address
    (m/-simple-schema
     (fn [{:keys [netId]} _]
       {:type (base32-address-schema-type "contract" netId)
        :pred #(pred % "contract" netId)
        :type-properties {:error/message (str "Invalid base32 contract address" (if netId (str ", with network id " netId) ""))
                          :doc (str "Base32 contract address" (if netId (str ", with network id " netId) ""))
                          :gen/fmap #(.call gen nil netId)}})))
  (def base32-builtin-address
    (m/-simple-schema
     (fn [{:keys [netId]} _]
       {:type (base32-address-schema-type "builtin" netId)
        :pred #(pred % "builtin" netId)
        :type-properties {:error/message (str "Invalid base32 builtin address" (if netId (str ", with network id " netId) ""))
                          :doc (str "Base32 builtin address" (if netId (str ", with network id " netId) ""))
                          :gen/fmap #(.call gen nil netId)}})))
  (def base32-null-address
    (m/-simple-schema
     (fn [{:keys [netId]} _]
       {:type (base32-address-schema-type "null" netId)
        :pred #(pred % "null" netId)
        :type-properties {:error/message (str "Invalid base32 null address" (if netId (str ", with network id " netId) ""))
                          :doc (str "Base32 null address" (if netId (str ", with network id " netId) ""))
                          :gen/fmap #(.call gen nil netId)}})))
  (def base32-schemas [base32-address base32-user-address base32-contract-address base32-builtin-address base32-null-address])
  base32-schemas)

(def Password (update-properties [:string {:min 8 :max 128}]
                                 :doc "String between 8 to 128 character" :type :password))
(def NetworkId (update-properties [:int {:min 0 :max 4294967295}]
                                  :type :network-id :doc "1029 for mainnet, 1 for testnet, 0 <= networkId <= 4294967295"))
(def AddressType (update-properties [:enum "user" "contract" "builtin" "null"]
                                    :type :address-type :doc "Is string, one of user contract builtin null"))

(def hex-string (update-properties
                 [:re #"^0(x|X)?[a-fA-F0-9]+$"]
                 :type :hexString
                 :gen/fmap #(str "0x"
                                 (-> js/Number.MAX_SAFE_INTEGER randomInt (.toString 16)))
                 :error/message "invalid hex string, should match regex ^0(x|X)?[a-fA-F0-9]+$"
                 :doc "hexadecimal string"))
(def Byte
  (update-properties [:re #"^0x([0-9a-fA-F]?){1,2}$"]
                     :type :byte
                     :error/message "should match regex ^0x([0-9a-fA-F]?){1,2}$"
                     :doc "hex encoded byte"))
(def Bytes
  (update-properties [:re #"^0x[0-9a-f]*$"]
                     :type :bytes
                     :error/message "should match regex ^0x[0-9a-f]*$"
                     :doc "hex encoded bytes"))
(def Bytes32
  (update-properties [:re #"^0x[0-9a-f]{64}$"]
                     :type :bytes-32
                     :error/message "should match regex ^0x[0-9a-f]{64}$"
                     :doc "32 hex encoded bytes"))
(def Bytes256
  (update-properties [:re #"^0x[0-9a-f]{512}$"]
                     :type :bytes-256
                     :error/message "should match regex ^0x[0-9a-f]{512}$"
                     :doc "256 hex encoded bytes"))
(def Bytes65
  (update-properties [:re #"^0x[0-9a-f]{512}$"]
                     :type :bytes-65
                     :error/message "should match regex ^0x[0-9a-f]{512}$"
                     :doc "65 hex encoded bytes"))
(def Uint
  (update-properties [:re #"^0x([1-9a-f]+[0-9a-f]*|0)$"]
                     :type :uint
                     :error/message "should match regex ^0x([1-9a-f]+[0-9a-f]*|0)$"
                     :doc "hex encoded unsigned integer"))
(def Uint256
  (update-properties [:re #"^0x[0-9a-f]{64}$"]
                     :type :uint-256
                     :error/message "should match regex ^0x[0-9a-f]{64}$"
                     :doc "hex encoded unsigned integer"))
(def Hash32
  (update-properties [:re #"^0x[0-9a-f]{64}$"]
                     :type :hash-32
                     :error/message "should match regex ^0x[0-9a-f]{64}$"
                     :doc "32 byte hex value"))
(def ChainId (update-properties Uint [:doc "chainid, 0x-prefixed hexadecimal string"]))
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
(def export-js-inst (m/-simple-schema
                     {:type            :js-date
                      :pred            (fn [d] (try
                                                 (or (inst? d) (inst? (js/Date. d)))
                                                 (catch js/Error err false)))
                      :type-properties {:error/message "should be a valid date string"
                                        :doc           "valid js date string"
                                        :gen/fmap      (fn [& args] (.toISOString (js/Date.)))}}))
(def export-seqable seqable?)
(def export-indexed indexed?)
(def export-mapp map?)
(def export-objp map?)
(def export-vectorp vector?)
(def export-list list?)
(def export-seq seq?)
(def export-char char?)
(def export-setp set?)
(def export-js-setp (m/-simple-schema
                     {:type            :js-set
                      :pred (fn [d] (and (vector? d) (= (count (into #{} d)) (count d))))
                      :type-properties {:error/message "should be a array without duplicate item"
                                        :doc           "array without duplicate item"
                                        :gen/fmap      (fn [& args] #{"a" 3 :abc false})}}))
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
(def export-hex-string hex-string)
(def export-chainId ChainId)
(def export-js-undefined
  (m/-simple-schema
   {:type :undefined
    :pred #(= js/undefined %)
    :type-properties {:error/message "should be undefined"
                      :doc "javascript undefined"
                      :gen/fmap (fn [& args] js/undefined)}}))
(def export-epoch-tag
  (update-properties
   [:enum "latest_mined" "latest_finalized" "latest_confirmed" "latest_state" "latest_checkpoint" "earliest" nil]
   :type :epoch-tag
   :error/message "must be one of latest_mined, latest_finalized, latest_confirmed, latest_state, latest_checkpoint, earliest or null"
   :doc "one of latest_mined, latest_finalized, latest_confirmed, latest_state, latest_checkpoint, earliest or null, default to latest_state"))

(def export-epoch-tag-no-mined
  (update-properties
   [:enum "latest_finalized" "latest_confirmed" "latest_state" "latest_checkpoint" "earliest" nil]
   :type :epoch-tag-no-mined
   :error/message "must be one of latest_finalized, latest_confirmed, latest_state, latest_checkpoint, earliest or null"
   :doc "one of latest_finalized, latest_confirmed, latest_state, latest_checkpoint, earliest or null, default to latest_state"))

(def export-epoch-ref
  (update-properties
   [:or export-epoch-tag Uint]
   :type :epoch-ref
   :error/message "invalid epoch ref, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"
   :doc "epoch number tag, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"))

(def export-epoch-ref-no-mined
  (update-properties
   [:or export-epoch-tag-no-mined Uint]
   :type :epoch-ref-no-mined
   :error/message "invalid epoch ref, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"
   :doc "epoch number tag, check the doc at https://developer.conflux-chain.org/conflux-doc/docs/json_rpc#the-epoch-number-parameter"))

(def export-block-tag
  (update-properties
   [:enum "latest" "earliest" "pending" "safe" "finalized" nil]
   :type :epoch-tag
   :error/message "invalid block tag, must be one of latest pending earliest safe or finalized"
   :doc "one of latest pending earliest safe or finalized, default to latest"))

(def export-block-ref
  (update-properties
   [:or export-block-tag Uint]
   :type :epoch-ref
   :error/message "invalid block ref, must be one of latest, pending, earliest, safe, finalized, block number or null"
   :doc "one of latest, pending, earliest, safe, finalized, block number or null"))

(def export-address-type
  (update-properties
   [:enum "builtin" "user" "contract"]
   :type :address-type
   :error/message "invalid conflux user type, must be one of builtin user contract"
   :doc "one of builtin user contract"))

(def export-url
  (update-properties
   [:re #"(?i)^(?:(?:https?)://)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))?\.?)(?::\d{2,5})?(?:[/?#]\S*)?$"]
   :gen/fmap (fn [] "https://example.com/")
   :type :url
   :error/message "invalid http/https url"
   :doc "http/https url"))

(def export-rich-url
  (update-properties
   [:re #"(?i)^(?:(?:((http|ws)s?|ipfs))://)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))?\.?)(?::\d{2,5})?(?:[/?#]\S*)?$"]
   :gen/fmap (fn [] "https://example.com/")
   :type :url
   :error/message "Invalid http/https/wss/ws/ipfs url"
   :doc "http/https/ws/wss/ipfs url"))

(defn at-least-one
  [name pred gen]
  (m/-simple-schema
   {:type            (str "at-least-one-" name)
    :pred            #(some pred %)
    :type-properties {:error/message (str "At least one fullfill " name)
                      :doc           (str "At least one fullfill " name)
                      :gen/fmap      gen}}))

(def export-at-least-one-http-or-https-url
  (update-properties
   [:and (at-least-one "starts-with-http" #(and (string? %) (.startsWith % "http")) (fn [] "https://example.com")) [:+ export-rich-url]]
   :type :at-least-one-http-or-https-url
   :error/message "should has at least one http/https url"
   :doc "array with at least one http/https url"
   :gen/fmap #(vector "https://example.com")))

(def nil-or-empty-vec
  (update-properties
   [:or export-js-undefined export-nil [:and vector? empty?]]
   :type :optional-param
   :doc "undefined, null or empty array"))

(def export-dbid
  (update-properties
   pos-int?
   :type :dbid
   :error/message "invalid dbid, must be a positive integer"
   :doc "database id, positive integer"))

(def export-token-symbol
  (update-properties
   [:and [:re #"^[a-zA-Z0-9+\-%/$]+$"] [:string {:min 1 :max 20}]]
   :error/message "invalid token symbol, 1. should match regex ^[a-zA-Z0-9+\\-%/$]+$ 2. length should between 1 to 20"
   :doc "token symbol"))

(def export-byte Byte)
(def export-bytes Bytes)
(def export-bytes32 Bytes32)
(def export-bytes256 Bytes256)
(def export-bytes65 Bytes65)
(def export-uint Uint)
(def export-uint256 Uint256)
(def export-hash32 Hash32)
(comment
  (set! (.-jtc js/window) j->c)

  :CIP23Domain

  {:types       {:EIP712Domain [{:name "name" :type "string"}
                                {:name "version" :type "string"}
                                {:name "chainId" :type "uint256"}
                                {:name "verifyingContract" :type "address"}]
                 :Person       [{:name "name" :type "string"}
                                {:name "mother" :type "Person"}
                                {:name "father" :type "Person"}]}
   :domain      {:name              "Family Tree"
                 :version           "1"
                 :chainId           1,
                 :verifyingContract "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"}
   :primaryType "Person"
   :message     {:name   "Jon"
                 :mother {:name   "Lyanna"
                          :father {:name "Rickard"}}
                 :father {:name   "Rhaegar"
                          :father {:name "Aeris II"}}}}

  (def type-value-spec [:map {:closed true} [:name string?] [:type string?]])

  (def type-props-spec [:+ type-value-spec])

  (def types-spec [:and
                   [:map [:EIP712Domain type-props-spec]]
                   [:map-of :keyword type-props-spec]])

  (m/validate types-spec {:EIP712Domain [{:name "name" :type "string"}
                                         {:name "version" :type "string"}
                                         {:name "chainId" :type "uint256"}
                                         {:name "verifyingContract" :type "address"}]
                          :Person       [{:name "name" :type "string"}
                                         {:name "mother" :type "Person"}
                                         {:name "father" :type "Person"}]}))
