const zh = {
  translation: {
    // - common
    cancel: '取消',
    create: '创建',
    next: '下一步',
    import: '导入',
    confirm: '确认',
    save: '保存',
    ok: '好的',
    sign: '签名',
    switch: '切换',
    no: '否',
    yes: '是',
    copiedSuccess: '复制成功',
    invalidAddress: '请填写有效的 Conflux 地址',
    invalidHexAddress: '请填写有效的十六进制地址',
    protocol: '协议',
    viewData: '查看数据',
    learnMore: '了解更多',
    optional: '可选的',
    back: '返回',
    transactionDetails: '交易明细',
    functionName: '功能',
    hexData: '十六进制数据',
    add: '添加',
    notFilled: '未填写',
    unCaughtErrMsg: '未知错误',

    // - home page
    send: '发送',
    history: '历史记录',
    assets: '资产',
    crossSpace: 'Cross Space',

    // - homepage / 连接网站状态模块和切换连接弹窗模块
    noConnectedDapp: '未连接至当前网站',
    connected: '已连接',
    disconnect: '断开连接',
    disconnectTitle: '断开连接',
    disconnectContent: '与此网站断开连接？',

    // - homepage / dapp connect site 弹窗
    connectSite: '连接至此网站？',
    selectNetwork: '想要使用哪个网络？',
    selectAuthorizedAccounts: '请选择需要授权的账户',
    selectAll: '全部',
    connect: '连接',
    chooseNetwork: '选择网络',

    // - homepage / 授权单个账户
    authorizeCurrentAccount: '授权 {{currentAccount}}',
    needAuthTitle: '需要授权',
    needAuthContent:
      '此账户未授权本网站<br/>授权此网站使用账户 {{accountName}} ？',

    // - homepage / 账户管理 / 账户列表
    myAccounts: '我的账户',
    addAccount: '添加账户',

    // homepage / 账户管理 / 创建账户
    manyAccounts: '{{accountNum}} 个账户',
    oneAccount: '1 个账户',

    newAccount: '新增账户',
    createAccount: '创建账户',
    useExistingSeed: '使用现有助记词',
    faster: '快捷',
    useExistingSeedDes: '遵循 HD 钱包标准，不需要再次备份.',
    newSeedPhrase: '新的助记词',
    newSeedPhraseDes: '生成一组新的助记词并需备份',
    importExistingAccount: '导入账户',
    seedPhrase: '导入助记词',
    seedPhraseDes: '助记词是一组由空格分隔的词组',
    pKey: '导入私钥',
    pKeysDes: '填写明文私钥',
    ledgerDes: '连接你的 Ledger 钱包',

    // homepage / 账户管理 / 创建账户 / 1. use existing seed phrase
    accountName: '账户名称',
    selectSeedPhrase: '选择一个助记词账户组',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase
    seedGroupName: '助记词账户组',
    invalidWord: '无效单词',
    seedCreateTitle: '下一步，助记词组将会展示出来',
    seedCreateContent:
      '获得了助记词就等于拥有了钱包里的资产<br/>助记词一旦丢失将无法找回，请妥善保管',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase / backup seed phrase
    backupSeedTitle: '备份助记词',
    backupSeedContent:
      '请按顺序复制助记词<br/>请勿在联网环境下共享和存储助记词',
    confirmSeedTitle: '助记词验证',
    confirmSeedContent: '请按顺序点击助记词，以确保备份正确',
    confirmSeedError: '助记词错误',

    // homepage / 账户管理 / 创建账户 / 3. Import existing account
    seedImport: '导入助记词',
    seedImportPlaceholder: '助记词是一组由空格分隔的词组，输入时请用空格分隔',
    duplicateSeedError: '此助记词在钱包中已存在',
    invalidSeed: '助记词无效，请再次检查',

    // homepage / 账户管理 / 创建账户 / 4. Import account with private key
    pKeyImport: '导入私钥',
    pKeyImportPlaceholder: '请在此填写私钥',
    duplicatePkError: '此私钥在钱包中已存在',
    invalidPrivateKey: '无效的私钥，请再次检查',

    // - Network
    network: '网络',
    mainnet: '主网',
    testnet: '测试网',
    custom: '自定义网络',

    // - add token
    addToken: '添加代币',
    searchToken: '通过名称或地址搜索',
    searchResults: '搜索结果',
    noResult: '无结果',

    // welcome page
    welcomeToConflux: '欢迎来到 Conflux 网络',

    // - login page
    welcomeBack: '欢迎回来',
    welcome: '进入 Web3 世界',
    password: '请输入密码',
    unlock: '解锁',
    passwordRulesWarning: '请使用 8～128 个字符，并且同时包含字母和数字',
    en: 'English',
    zh: '简体中文',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: '发送交易',
    toAddressLabel: '接收方',
    toAddressPlaceholder: '请输入一个地址',
    tokenAndAmount: '代币和数量',
    available: '余额: ',
    max: '最大',

    // - Send Transaction / choose token
    chooseToken: '选择代币',
    tokenList: '代币列表',
    noTxnWarning: '该地址此前没有任何交易，请确保无误',

    // - Send Transaction / Sign Transaction
    signTransaction: '交易签名',
    sendToken: '发送代币',
    toAddress: '接收方地址',
    gasFee: 'Gas fee',
    edit: '编辑',
    sponsored: '已赞助',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFeeControl: 'Gas 控制器',
    gasPrice: 'Gas 价格',
    gasLimit: 'Gas 限制',
    storageFee: '存储抵押费',
    storageCollateralized: '存储抵押限制',
    totalFee: 'Total Fee',
    customNonce: '自定义 Nonce',
    gasPriceErrMSg: 'Gas 价格最小是 1 {{unit}}',
    gasLimitMinErr: 'Gas 限制至少是 {{gasUsed}}',
    gasLimitMaxErr: 'Gas 限制最多是 {{gasMax}}',
    nonceErr: 'Nonce 不能是 0',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: '交易已提交',
    viewOnScan: '在区块链浏览器中查看',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: '代币授权',
    approveTo: '授权给',
    contract: '合约',
    allowLimit: '授权数额',
    action: '行为',
    balance: '余额',
    createContract: '部署合约',

    // - Send Transaction / Sign Transaction / 3. token approve - view data
    // 此处展示内容为交易详情，在多种情况是相同的，不止是 token approve 这个场景，详见 common

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: '编辑权限',
    spendLimitPermission: '授权数额权限',

    // 允许操作的限额权限描述
    allowSpendDes: '允许 {{dapp}} 转账和花费的最大数额:',
    proposedApprovalLimit: '建议授权的数额',
    proposedApprovalLimitDes: '由 {{dapp}} 给出的建议',
    customSpendLimit: '自定义授权数额',
    customSpendLimitDes: '输入一个最大花费限额',
    customLimitErr: '限额必须大于 0 {{unit}}',

    // - Send Transaction / - history
    activity: '历史记录',
    failed: '失败',
    executed: '已执行',
    pending: '等待中',
    sending: '发送中',
    contractCreation: '合约部署',
    contractInteraction: '合约交互',
    unknown: '未知的',

    // - request signature - 1. Sign Text
    signText: '文本签名',
    signThisText: '签署这个文本?',

    // - request signature - 2. Sign Message
    signThisMessage: '签署这个信息？',
    signTypeMessage: '签署类型信息',
    message: '信息',

    // - add network
    addNetwork: '添加网络',
    allowAddNetwork: '允许这个网站添加网络？',
    warningAddNetwork: '你信任这个网站吗？Fluent 无法确定此网络的安全性',
    networkName: '网络名称',
    networkUrl: 'RPC URL',
    chainId: '区块链 ID',
    currencySymbol: '代币符号（可选的）',
    blockExplorerUrl: '区块链浏览器地址（可选的）',

    // - add suggested token
    addSuggestedToken: '添加代币',
    confirmAddSuggestedToken: '确认添加这个代币到列表吗？',

    // - Switch Network
    switchNetwork: '切换网络',
    allowSwitchNetwork: '允许此网站切换网络?',
    warningSwitchNetwork: '这将会把网络切换至钱包已经添加的网络',

    // - set password page
    setPWD: '设置密码',
    enterPWD: '输入密码',
    enterPWDAgain: '再次输入密码',
    rememberPWD: '此密码无法找回，请确保牢记',
    invalidPassword: '密码错误',
    invalidConfirmPassword: '两次输入的密码不一致',
    // - welcome page
    hello: '欢迎',

    // - migration
    migration: '一键迁移',

    // account management
    accountManagement: '账户管理',
    lock: '锁定',
    enterPassword: '输入密码以继续',
    viewSeed: '查看助记词',
    hide: '隐藏',
    delete: '删除',
    groupDeleteWarning: '不能删除当前账户组',
    accountHideWarning: '不能隐藏当前账户',

    // Network Management
    networkManagement: '网络管理',
    newRpcUrl: 'RPC URL',
    networkType: '网络类型',
    wrongRpcUrl: '不能获取到区块链 ID，请确认 RPC URL 是否正确',
    networkDeleteWarning: '不能删除当前网络',
    duplicateNetworkEndpoint: '重复的网络端点',
    urlWarning: '请填写 Http/Https 前缀',
    invalidRpcUrl: '无效的 RPC URL',

    // About
    about: '关于',
    website: '官网',
    feedback: '反馈',
    docs: '文档',
    version: '版本号',

    // Developer Mode
    developerMode: '开发者模式',
    compatibilityMode: '兼容模式',
    compatibilityDes:
      'Fluent 最终将会停止支持 ConfluxPortal 的 API。为了方便开发者测试，关掉开关将模拟 Fluent 不支持 ConfluxPortal API 的环境',

    // backup seed
    backupIdentity: '备份助记词',
    backupSeedDes: '请以正确的顺序备份助记词，不要在网络环境中存储或分享助记词',
    backupPk: '备份私钥',
    backupPkDes:
      '获得了私钥就等于拥有了钱包里的资产，请妥善保管，一单丢失就无法找回',

    transferAmountExceedsAllowance: '转账金额超出限制',
    balanceIsNotEnough: '余额不足',
    gasFeeIsNotEnough: 'Gas 不足',
    contractError: '合约错误: ',
    addressHasBeenChanged: '地址已发生改变',
    invalidPasswordFromRpc: '密码错误',
    required: '请填写助记词',
    changeNetworkError: '切换网络发生错误',

    // hardware guard
    connectHardwareWallet: '连接硬件钱包',
    supportLedger: '现已支持 Ledger 硬件钱包',
    ledgerGuardDes: '如何在 Ledger 中创建一个 Conflux 钱包?',
    followConnectLedgerSteps: '请根据以下步骤连接 Ledger',
    steps: '步骤 {{number}}',
    pluginHardwareWallet: '请将硬件钱包插入电脑的 USB 端口',
    enterPinCode: '在硬件钱包上输入 PIN 码',
    selectConfluxApp: '选择并打开 Conflux App',
    ready: '开始连接',

    // connect hardware wallet
    searchHwWallet: '寻找钱包中',
    connectLedgerTips: '连接并解锁你的 Ledger，并在浏览器中授权连接请求',
    connectLedger: '连接你的 Ledger',
    connectLedgerDes: '点击下面的按钮开始授权连接',
    waitForPermission: '等待授权',
    connectFailed: '连接失败',
    retry: '重试',
    openConfluxApp: '打开 Conflux App',
    openConfluxAppDes: '在硬件钱包中选择并打开 Conflux App',
    chooseAddress: '选择地址',
    hdPath: '钱包路径',
    chooseHwAddress: '选择你要导入的钱包地址:',
    capNext: '下一页',
    capPrev: '上一页',
    adding: '添加中',
    keepHwConnected: '请保持 Ledger 的连接状态',
    accountAdded: '账户已添加',
    importedHwAccount: '你现在可以从 Fluent 中访问 Ledger 钱包，请在插件中操作',
    done: '完成',
    refreshLater: '请稍后再试',
    hardwareWallet: '硬件钱包',
    pKeyGroupName: '账户名称',

    // confirm hw Modal
    waitingForSign: '等待签名',
    rejected: '拒绝',
    waitingContent: '请在 Ledger 中确认此交易',
    rejectedContent: '交易被拒绝',

    // conflux confirm tx error
    txPoolFull: '交易池拥堵',
    nodeInCatchUpMode: '节点追块中',
    canNotRecoverPubKey: '无法恢复公钥',
    rlpIncorrectListLen: '无效的 RLP 列表长度',
    chainIdMismatch: '无法匹配 Chain ID',
    zeroGasPrice: 'Gas 价格不能为 0',
    tooDistantFuture: 'Nonce 值太大',
    duplicateTx: '重复的交易',
    epochHeightOutOfBound: '超出纪元高度范围',
    gasExceedsLimit: '超出 Gas 限制',
    tooStaleNonce: 'Nonce 太旧',
    replacedWithHigherGasPriceTx: '重复的交易',
    unknownError: '未知错误',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger 未连接',
    openExpandView: '在 Fluent 扩展视图连接硬件钱包',
    hwOpenApp: '请确保 Conflux App 已打开，再点击确认',

    // error page
    errorTile: '错误',
    errorDes: '未知错误',
    routeError: '你访问的页面不存在',
    errorCode: '错误码',
    feedBackCode: '复制错误信息并反馈',
    fullNodeError: '无法连接到 RPC 节点',
  },
}

export default zh
