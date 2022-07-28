(ns cfxjs.db.schema
  (:require
   [lambdaisland.glogi :as log]))

(def current-schema (atom nil))

(defn- parse-attr-value [{:keys [ref many one doc identity value component persist index tuples]}]
  (cond ref              [:db/valueType :db.type/ref]
        many             [:db/cardinality :db.cardinality/many]
        one              [:db/cardinality :db.cardinality/one]
        ;; doc              [:db/doc doc]
        doc              []
        identity         [:db/unique :db.unique/identity]
        value            [:db/unique :db.unique/value]
        index            [:db/unique :db/index]
        (false? persist) [:db/persist false]
        component        [:db/isComponent true]
        tuples           [:db/tupleAttrs (mapv keyword tuples)]))

(defn js-schema->schema
  "Convert js schema format to datascript schema,

  Example input js schema:

  ```js
  {
    vault: {
      type: {
        doc: 'Type of vault: public, pk, mnemonic',
      },
      data: {
        doc: 'Encrypted vault data',
      },
    },
    account: {
      hexAddress: {
        identity: true,
        doc: 'Account hex address',
      },
      vault: {
        ref: true,
        doc: 'Entity ID of vault',
      },
    },
  }
  ```

  Corresponding clj schema:

  ```clojure
  {:vault/type {:db/doc 'Type of vault: public pk mnemonic'}
   :vault/data {:db/doc 'Encrypted vault data'}
   :account/hexAddress {:db/unique :db.unique/identity
                        :db/doc 'Account hex address'}
   :account/vault {:db/valueType :db.type/ref
                   :db/doc 'Entity ID of vault'}}
  ```
"
  [s]
  (let [;; _ (js/console.time "a")
        x (into {}
                (mapcat
                 (fn [[parentk attrs]]
                   (reduce-kv
                    (fn [attrm attrk attrv]
                      (let [k (keyword (str (name parentk) "/" (name attrk)))
                            v (reduce-kv
                               (fn [sm sk sv]
                                 (let [[sk sv] (parse-attr-value {sk sv})]
                                   (if sk
                                     (assoc sm sk sv)
                                     sm)))
                               {}
                               attrv)]
                        (if (and (-> v keys count pos?))
                          (assoc attrm k v)
                          attrm)))
                    {}
                    attrs))
                 s))]
    ;; (js/console.timeEnd "a")
    x))

(defn js-schema->query-structure
  "Convert datascript schema from js to clj, example:

  From:
  ```js
  {
    vault: {
      type: {
        doc: 'Type of vault: public, pk, mnemonic',
      },
      data: {
        doc: 'Encrypted vault data',
      },
      accounts: {
        doc: 'Accounts belong to this vault',
        many: true,
        ref: 'account,
        component: true,
      },
    },
    account: {
      hexAddress: {
        identity: true,
        doc: 'Account hex address',
      },
      vault: {
        ref: 'vault,
        doc: 'Entity ID of vault',
      },
    },
  }
  ```

  To:
  ```clojure
  {:vault {:attr-keys (:type :data :accounts)
           :attrs {:type {:doc \"Type of vault: public pk mnemonic\"}
                   :data {:doc \"Encrypted vault data\"}
                   :accounts {:doc \"Accounts belong to this vault\"
                              :many true
                              :ref :account
                              :component true}}}
   :account {:attr-keys (:hexAddress :vault)
             :attrs {:hexAddress {:identity true
                                  :doc \"Account hex address\"}
                     :vault {:ref :vault
                             :doc \"Entity ID of vault\"}}}}
  ```
  "
  [s]
  (let [;; reduce-attr-property (fn [acc k3 v3] (if (= k :ref) (assoc acc k3 (keyword v3)) acc))
        reduce-model-attr (fn [acc k2 v2] (assoc acc k2 (reduce-kv
                                                         (fn [acc k3 v3] (cond
                                                                           (and (= k3 :ref) (string? v3)) (assoc acc :ref (keyword v3))
                                                                           (= k3 :ref) (assoc acc :ref k2)
                                                                           :else acc))
                                                         v2 v2)))
        reduce-schema-model (fn [acc k v]
                              (let [v (reduce-kv reduce-model-attr {} v)
                                    acc (assoc-in acc [k :attr-keys] (keys v))
                                    acc (assoc-in acc [k :attrs] v)]
                                acc))
        schema (reduce-kv reduce-schema-model {} s)]
    (reset! current-schema schema)
    @current-schema))

(defn qattr->model [qattr] (keyword (namespace qattr)))
(defn qattr->attrk [qattr] (keyword (name qattr)))

(defn model->attr-keys [model] (get-in @current-schema [model :attr-keys]))
(def qattr->attr-keys (comp model->attr-keys qattr->model))
(defn ref-qattr->model [qattr] (get-in @current-schema [(qattr->model qattr) :attrs (qattr->attrk qattr) :ref]))

(comment
  (let [schema {:vault
                {:type  {:doc "Type of vault: pub, pk, hd"},
                 :data  {:doc "Encrypted vault data"},
                 :ddata {:doc "Decrypted vault data only in memory", :persist false},
                 :cfxOnly
                 {:doc
                  "If type is pub, means this vault is only for cfx type network, if type is hd, means only generate 0x1 prefix account"}},
                :hdPath    {:value {:value true}, :name {:identity true}},
                :address
                {:vault         {:ref true},
                 :pk            {:doc "the private key of the address", :persist false},
                 :index         {:doc "Address index in hd path, starts from 0"},
                 :value         {:doc "address string, hex or base32 based on network"},
                 :token         {:doc "tokenlist of this address", :many true, :ref true},
                 :balance
                 {:doc       "token balances of this address",
                  :many      true,
                  :ref       true,
                  :component true},
                 :hex           {:doc "The value of the address, not cfx hex address"},
                 :tx
                 {:doc       "transactions of this address",
                  :many      true,
                  :component true,
                  :ref       true},
                 :id            {:tuples ["address/network" "address/value"], :identity true},
                 :network       {:ref true},
                 :nativeBalance {:doc "balance of this address"}},
                :tokenList
                {:url   {:doc "token list url", :identity true},
                 :name  {:doc "token list name"},
                 :value {:doc "token list value, json data get from token list"},
                 :token {:doc "token of this token list", :many true, :ref true}},
                :site
                {:origin
                 {:identity true,
                  :doc      "domain of the map, eg: https://.* or chrome-extension://.*"},
                 :name {:doc "site name"},
                 :icon {:doc "site icon href"},
                 :post
                 {:persist false,
                  :doc     "the function to post message to inpage runtime"}},
                :txPayload
                {:epochHeight          {:doc "epochHeight"},
                 :maxFeePerGas         {:doc "maxFeePerGas"},
                 :gasPrice             {:doc "gasPrice"},
                 :value                {:doc "value"},
                 :gas                  {:doc "gas"},
                 :type                 {:doc "tx type"},
                 :storageLimit         {:doc "storageLimit"},
                 :chainId              {:doc "chainId"},
                 :from                 {:doc "from addr"},
                 :maxPriorityFeePerGas {:doc "maxPriorityFeePerGas"},
                 :accessList           {:doc "accessList"},
                 :nonce                {:doc "nonce"},
                 :to                   {:doc "to addr"},
                 :data                 {:doc "data"}},
                :account
                {:id       {:tuples ["account/index" "account/group"], :identity true},
                 :index    {:doc "index of account in account group"},
                 :group    {:ref "accountGroup"},
                 :nickname {:doc "account nickname"},
                 :address  {:many true, :component true, :ref true},
                 :hidden   {:doc "If hide this account in ui"},
                 :offline  {:doc "Offline account"},
                 :selected {:doc "selected by wallet"}},
                :token
                {:address  {:doc "address, hex or base32"},
                 :decimals {:doc "token decimal"},
                 :logoURI  {:doc "token logo image"},
                 :symbol   {:doc "token symbol"},
                 :name     {:doc "token name"},
                 :fromApp  {:doc "true when from app"},
                 :fromList {:doc "true when from token list"},
                 :balance
                 {:doc       "balances of this token",
                  :ref       true,
                  :many      true,
                  :component true},
                 :tx       {:doc "token txs", :ref true},
                 :id       {:tuples ["token/network" "token/address"], :identity true},
                 :fromUser {:doc "true when from user"},
                 :network  {:ref true}},
                :balance
                {:value {:doc "balance value of one address/token tuple in hex"}},
                :txExtra
                {:ok                  {:doc "extra data is finished"},
                 :contractCreation    {:doc "contract creation tx"},
                 :simple              {:doc "simple tx"},
                 :contractInteraction {:doc "contract interaction tx"},
                 :token20             {:doc "20 contract"},
                 :tokenNFT            {:doc "nft contract"}},
                :tx
                {:receipt       {:doc "receipt as an object"},
                 :blockHash     {:doc "block this tx packaged in"},
                 :payload
                 {:doc "tx payload as an object", :ref "txPayload", :component true},
                 :hash          {:doc "tx hash", :identity true},
                 :raw           {:doc "raw tx hash"},
                 :err           {:doc "basic error type/info"},
                 :extra         {:doc "enriched tx info", :ref "txExtra", :component true},
                 :created       {:doc "created timestamp get with new Date().getTime()"},
                 :chainSwitched {:doc "chain switched"},
                 :fromFluent    {:doc "tx sumitted from fluent"},
                 :status
                 {:doc
                  "int, tx status, -2 skipped, -1 failed, 0 unsent, 1 sending, 2 pending, 3 packaged, 4 executed, 5 confirmed"}},
                :app
                {:site           {:ref true, :identity true},
                 :name           {:doc "name of the app"},
                 :currentNetwork {:ref "network"},
                 :permUpdatedAt
                 {:doc "permision last updated at, generated by Date.now()"},
                 :account        {:doc "authed accounts", :ref true, :many true},
                 :tx             {:many true, :ref true, :doc "tx initiated by this app"},
                 :currentAccount {:ref "account"},
                 :network        {:doc "authed network", :ref true, :many true},
                 :perms
                 {:doc
                  "authorized permissions, eg. {wallet_basic: {}, wallet_accounts: {}}"}},
                :authReq
                {:req  {:doc "the req body of the auth req", :persist false},
                 :site {:ref true, :persist false},
                 :app  {:ref true, :persist false},
                 :c    {:doc "csp channel of the req listener", :persist false}},
                :network
                {:isTestnet      {:doc "is testnet network"},
                 :hdPath         {:ref true},
                 :isMainnet      {:doc "is mainnet network"},
                 :selected       {:doc "network selected by wallet"},
                 :tokenList
                 {:doc "token list of this network", :ref true, :component true},
                 :isCustom       {:doc "is custom network"},
                 :cacheTime      {:doc "epoch/block time of this network"},
                 :name
                 {:identity true,
                  :doc
                  "Name of a network, used as id of network, builtin network name can't be changed, reload(reinit) the extension if network name changed"},
                 :ticker
                 {:doc
                  "A object with info of the currency, eg. {name: \"Ethereum\", symbol: \"CFX\", decimals: 18, iconUrls: [...svg]}"},
                 :type
                 {:doc
                  "One of 'cfx'/'eth', indicating type of rpc set of this network"},
                 :icon           {:doc "Array of icon url of this network"},
                 :netId          {:doc "Network id, decimal"},
                 :chainId        {:doc "Network chain id, hexadecimal"},
                 :balanceChecker {:doc "balance checker contract address"},
                 :scanUrl        {:doc "Url of block chain explorer"},
                 :endpoint
                 {:value true, :doc "RPC endpoint of a network, can't be duplicate"},
                 :builtin        {:doc "Indicating builtin network, shouldn't be deleted"}},
                :unlockReq {:req {:persist false}},
                :accountGroup
                {:nickname {:doc "account group nickname"},
                 :vault    {:ref true, :doc "Entity ID of vault", :identity true},
                 :hidden   {:doc "If hide this accountGroup in ui"}}}]
    (js-schema->query-structure schema)
    (tap> (js-schema->query-structure schema))))
