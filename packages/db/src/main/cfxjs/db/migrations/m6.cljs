(ns cfxjs.db.migrations.m6
  (:require
   [cfxjs.db.migutil :refer [update-version-tx]]
   [cfxjs.db.datascript.core :as d]))

(def id 6)

(defn up [old-db]
  (let [eth-hdpath-id           (d/q '[:find ?hdpath .
                                       :where
                                       [?hdpath :hdPath/name "eth-default"]]
                                     old-db)
        uniswap-tokenlist       {:db/id          -1
                                 :tokenList/url  "https://cdn.jsdelivr.net/gh/conflux-fans/token-list/eth.uniswap.json"
                                 :tokenList/name "Uniswap Default List"}
        espace-tokenlist        {:db/id          -2
                                 :tokenList/url  "https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx-espace.fluent.json"
                                 :tokenList/name "Conflux eSpace Default Token List"}
        e-space-mainnet         {:db/id                  -3
                                 :network/name           "Conflux eSpace"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg"
                                 :network/endpoint       "https://evm.confluxrpc.com"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x406"
                                 :network/netId          1030
                                 :network/ticker         {:name     "Conflux"
                                                         :symbol   "CFX"
                                                         :decimals 18
                                                         :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://evm.confluxscan.org"
                                 :network/cacheTime      4000
                                 :network/tokenList      -2
                                 :network/balanceChecker "0x74191f6b288dff3db43b34d3637842c8146e2103"
                                 :network/isMainnet      true}
        eth-mainnet             {:db/id                  -4
                                 :network/name           "Ethereum Mainnet"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                                 :network/endpoint       "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x1"
                                 :network/netId          1
                                 :network/ticker         {:name     "Ether"
                                                          :symbol   "ETH"
                                                          :decimals 18
                                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://etherscan.io"
                                 :network/cacheTime      15000
                                 :network/tokenList      -1
                                 :network/balanceChecker "0xb1f8e55c7f64d203c1400b9d8555d050f94adf39"
                                 :network/isMainnet      true
                                 :network/gasBuffer      1.5}
        e-space-testnet         {:db/id                  -5
                                 :network/name           "eSpace Testnet"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Conflux.svg"
                                 :network/endpoint       "https://evmtestnet.confluxrpc.com"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x47"
                                 :network/netId          71
                                 :network/ticker         {:name     "Conflux"
                                                         :symbol   "CFX"
                                                         :decimals 18
                                                         :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/cfx.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://evmtestnet.confluxscan.org"
                                 :network/cacheTime      4000
                                 :network/balanceChecker "0x74191f6b288dff3db43b34d3637842c8146e2103"
                                 :network/isTestnet      true}
        ropsten                 {:db/id                  -6
                                 :network/name           "Ethereum Ropsten"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                                 :network/endpoint       "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x3"
                                 :network/netId          3
                                 :network/ticker         {:name     "Ether"
                                                          :symbol   "ETH"
                                                          :decimals 18
                                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://ropsten.etherscan.io"
                                 :network/cacheTime      15000
                                 :network/balanceChecker "0x8d9708f3f514206486d7e988533f770a16d074a7"
                                 :network/isTestnet      true
                                 :network/gasBuffer      1.5
                                 }
        rinkeby                 {:db/id                  -7
                                 :network/name           "Ethereum Rinkeby"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                                 :network/endpoint       "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x4"
                                 :network/netId          4
                                 :network/ticker         {:name     "Ether"
                                                          :symbol   "ETH"
                                                          :decimals 18
                                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://rinkeby.etherscan.io"
                                 :network/cacheTime      15000
                                 :network/balanceChecker "0x3183b673f4816c94bef53958baf93c671b7f8cf2"
                                 :network/isTestnet      true
                                 :network/gasBuffer      1.5
                                 }
        goerli                  {:db/id                  -8
                                 :network/name           "Ethereum Goerli"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                                 :network/endpoint       "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x5"
                                 :network/netId          5
                                 :network/ticker         {:name     "Ether"
                                                          :symbol   "ETH"
                                                          :decimals 18
                                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://goerli.etherscan.io"
                                 :network/cacheTime      15000
                                 :network/balanceChecker "0x9788c4e93f9002a7ad8e72633b11e8d1ecd51f9b"
                                 :network/isTestnet      true
                                 :network/gasBuffer      1.5
                                 }
        kovan                   {:db/id                  -9
                                 :network/name           "Ethereum Kovan"
                                 :network/icon           "https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/Ethereum.svg"
                                 :network/endpoint       "https://kovan.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
                                 :network/type           "eth"
                                 :network/hdPath         eth-hdpath-id
                                 :network/chainId        "0x2a"
                                 :network/netId          42
                                 :network/ticker         {:name     "Ether"
                                                          :symbol   "ETH"
                                                          :decimals 18
                                                          :iconUrls ["https://cdn.jsdelivr.net/gh/Conflux-Chain/helios@dev/packages/built-in-network-icons/eth.svg"]}
                                 :network/builtin        true
                                 :network/scanUrl        "https://kovan.etherscan.io"
                                 :network/cacheTime      15000
                                 :network/balanceChecker "0x55abba8d669d60a10c104cc493ec5ef389ec92bb"
                                 :network/isTestnet      true
                                 :network/gasBuffer      1.5}
        cfx-mainnet-id          (d/q '[:find ?net .
                                       :where
                                       [?net :network/builtin true]
                                       [?net :network/type "cfx"]
                                       [?net :network/chainId "0x405"]]
                                     old-db)
        change-cfx-mainnet-name {:db/id cfx-mainnet-id :network/name "Conflux Mainnet"}
        txs                     [change-cfx-mainnet-name
                                 uniswap-tokenlist
                                 espace-tokenlist
                                 e-space-mainnet
                                 eth-mainnet
                                 e-space-testnet
                                 ropsten rinkeby goerli kovan
                                 (update-version-tx old-db id)]
        new-db                  (d/db-with old-db txs)]
    new-db))

(defn down [new-db]
  (let [cfx-mainnet-id          (d/q '[:find ?net .
                                       :where
                                       [?net :network/builtin true]
                                       [?net :network/type "cfx"]
                                       [?net :network/chainId "0x405"]]
                                     new-db)
        change-cfx-mainnet-name {:db/id cfx-mainnet-id :network/name "Conflux Hydra"}
        addrs-to-retract        (d/q '[:find [?addr ...]
                                       :where
                                       [?addr :network]
                                       (or
                                        [?addr :address/network [:network/name "Conflux eSpace"]]
                                        [?addr :address/network [:network/name "Conflux eSpace (Testnet)"]]
                                        [?addr :address/network [:network/name "Ethereum Mainnet"]]
                                        [?addr :address/network [:network/name "Ethereum Ropsten"]]
                                        [?addr :address/network [:network/name "Ethereum Rinkeby"]]
                                        [?addr :address/network [:network/name "Ethereum Goerli"]]
                                        [?addr :address/network [:network/name "Ethereum Kovan"]])]
                                     new-db)
        tokens-to-retract       (d/q '[:find [?token ...]
                                       :where
                                       [?token :network]
                                       (or
                                        [?token :token/network [:network/name "Conflux eSpace"]]
                                        [?token :token/network [:network/name "Conflux eSpace (Testnet)"]]
                                        [?token :token/network [:network/name "Ethereum Mainnet"]]
                                        [?token :token/network [:network/name "Ethereum Ropsten"]]
                                        [?token :token/network [:network/name "Ethereum Rinkeby"]]
                                        [?token :token/network [:network/name "Ethereum Goerli"]]
                                        [?token :token/network [:network/name "Ethereum Kovan"]])]
                                     new-db)
        addr-retract-txs        (map (fn [addr-id] [:db.fn/retractEntity addr-id]) addrs-to-retract)
        token-retract-txs       (map (fn [token-id] [:db.fn/retractEntity token-id]) tokens-to-retract)
        txs                     (concat
                                 token-retract-txs
                                 addr-retract-txs
                                 [change-cfx-mainnet-name
                                  [:db.fn/retractEntity [:network/name "Conflux eSpace"]]
                                  [:db.fn/retractEntity [:network/name "Conflux eSpace (Testnet)"]]
                                  [:db.fn/retractEntity [:network/name "Ethereum Mainnet"]]
                                  [:db.fn/retractEntity [:network/name "Ethereum Ropsten"]]
                                  [:db.fn/retractEntity [:network/name "Ethereum Rinkeby"]]
                                  [:db.fn/retractEntity [:network/name "Ethereum Goerli"]]
                                  [:db.fn/retractEntity [:network/name "Ethereum Kovan"]]
                                  [:db.fn/retractEntity [:tokenList/url "https://cdn.jsdelivr.net/gh/conflux-fans/token-list/eth.uniswap.json"]]
                                  [:db.fn/retractEntity [:tokenList/url "https://cdn.jsdelivr.net/gh/conflux-fans/token-list/cfx-espace.fluent.json"]]
                                  (update-version-tx new-db (dec id))])
        old-db                  (d/db-with new-db txs)]
    old-db))

(def data {:up up :down down :id id})
