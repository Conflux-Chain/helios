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
    invalidAddress: '请输入有效的 CFX 地址或 .Web3 用户名',
    invalidHexAddress: '请输入有效的 0x 地址或 ENS 域名',
    unChecksumAddress: '无效地址，请确保字母大小写无误',
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

    // - homepage / dapp footer
    noConnectedDapp: '未连接至当前网站',
    connected: '已连接',
    disconnect: '断开连接',
    disconnectTitle: '断开连接',
    disconnectContent: '与此网站断开连接？',

    // - homepage / dapp connect site popup
    connectSite: '连接至此网站？',
    permissionRequest: '权限申请',
    allowPermission: '授权给此网站以下权限？',
    selectNetwork: '想要使用哪个网络？',
    selectAuthorizedAccounts: '授权账户',
    selectAll: '全部',
    connect: '连接',
    chooseNetwork: '选择网络',
    viewSelectedAddress: '查看选中账户的地址',
    viewMultiAddress: '查看选中账户的多链地址',

    // - homepage / authorize single account
    authorizeCurrentAccount: '授权 {{currentAccount}}',
    needAuthTitle: '需要授权',
    needAuthContent:
      '此账户未授权本网站<br/>授权此网站使用账户 {{accountName}} ？',

    // - homepage / account management / account list
    myAccounts: '我的账户',
    addAccount: '添加账户',
    search: '搜索',

    // homepage / account management / create account
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

    // homepage / account management / create account / 1. use existing seed phrase
    accountName: '账户名称',
    selectSeedPhrase: '选择一个助记词账户组',

    // homepage / account management / create account / 2. new seed phrase
    seedGroupName: '助记词账户组',
    invalidWord: '无效单词',
    seedCreateTitle: '下一步，助记词组将会展示出来',
    seedCreateContent:
      '获得了助记词就等于拥有了钱包里的资产<br/>助记词一旦丢失将无法找回，请妥善保管',

    // homepage / account management / create account / 2. new seed phrase / backup seed phrase
    backupSeedTitle: '备份助记词',
    backupSeedContent:
      '请按顺序复制助记词<br/>请勿在联网环境下共享和存储助记词',
    confirmSeedTitle: '助记词验证',
    confirmSeedContent: '请按顺序点击助记词，以确保备份正确',
    confirmSeedError: '助记词错误',

    // homepage / account management / create account / 3. Import existing account
    seedImport: '导入助记词',
    seedImportPlaceholder: '助记词是一组由空格分隔的词组，输入时请用空格分隔',
    duplicateSeedError: '此助记词在钱包中已存在',
    invalidSeed: '助记词无效，请再次检查',

    // homepage / account management / create account / 4. Import account with private key
    pKeyImport: '导入私钥',
    pKeyImportPlaceholder: '请在此填写私钥',
    duplicatePkError: '此私钥在钱包中已存在',
    invalidPrivateKey: '无效的私钥，请再次检查',

    // - Network
    network: '网络',
    mainnet: '主网',
    testnet: '测试网',
    custom: '自定义网络',
    switchTestnetDisplay:
      '<Container><SwitchButton>显示/隐藏</SwitchButton>测试网络</Container>',

    // - add token
    addToken: '添加代币',
    searchToken: '通过名称或地址搜索',
    searchResults: '搜索结果',
    noResult: '无结果',
    remove: '移除',

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
    fr: 'Français (Communauté)',
    ru: 'Pусский (Сообщество)',
    uk: 'Українська (Cпільнота)',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: '发送交易',
    toAddressLabel: '接收方',
    toAddressPlaceholder: '地址(cfx*:) 或者 .web3 用户名',
    tokenAndAmount: '代币和数量',
    available: '余额: ',
    max: '最大',
    web3Name: '.web3 用户名',
    alternativeName: '账户名/备注',

    // - Send Transaction / choose token
    chooseToken: '选择代币',
    tokenList: '代币列表',
    noTxnWarning: '该地址此前没有任何交易，请确保无误',

    // - Send Transaction / Sign Transaction
    signTransaction: '交易签名',
    sendToken: '发送代币',
    toAddress: '接收方地址',
    gasFee: '燃气费',
    edit: '设置',
    sponsored: '已赞助',
    partSponsored: '部分赞助',

    // - Send Transaction / Error or Warning
    error: '错误',
    warning: '警告',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFee: '设置燃气费',
    low: '低速',
    medium: '正常',
    high: '高速',
    suggested: '建议值',
    advanced: '高级选项',
    gasCost: '预估燃气花费',
    gasOption: '燃气选项',
    gasFeeDetail: '燃气费明细',
    maxFeePerGas: '每单位燃气最高价格',
    maxPriorityFeePerGas: '每单位燃气最高小费',
    maxFee: '最高花费',
    baseFee: '基本费用',
    priorityFee: '小费',
    current: '当前: ',
    twelveHour: '12 小时: ',
    gasPrice: '燃气价格',
    gasLimit: '燃气限制',
    storageFee: '存储抵押费',
    storageLimit: '存储抵押限制',
    totalFee: '总费用',
    customNonce: '自定义随机数',
    gasPriceErr: '燃气价格最小值是 {{amount}} {{unit}}',
    maxPriorityFeePerGasLowErr: '此处输入的最小值应为 {{amount}} {{unit}}',
    maxPriorityFeePerGasHighErr: '输入的值需要小于等于 "每单位燃气最高价格"',
    gasLimitMinErr: '燃气限制至少是 {{gasUsed}}',
    gasLimitMaxErr: '燃气限制最多是 {{gasMax}}',
    nonceErr: '随机数需要大于等于 0',

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

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: '编辑权限',
    spendLimitPermission: '授权数额权限',

    // approve allowance
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
    receive: '接收',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: '取消交易',
    speedUp: '加速',
    suggestedGasPrice: '建议的燃气价格',
    inputGasPrice: '设置燃气价格',
    spend: '将花费',
    cancelTxDes:
      '尝试取消，提交并不意味着取消成功。如果执行成功，您将被收取以上数额的燃气费',
    speedupTxDes:
      '尝试加速，提交并不意味着加速成功。如果执行成功，您将被收取以上数额的燃气费',
    speedupTransaction: '交易加速',
    submit: '提交',
    customGasPrice: '自定义燃气价格',
    executedTx: '此交易已被执行或者已完成，不需要执行额外操作',
    amount: '数额',
    hash: '交易哈希',
    nonce: '随机数',
    fromAddress: '发送方',
    expeditedCancellation: '加速取消',

    // - request signature - 1. Sign Text
    signText: '文本签名',
    signThisText: '签署这个文本？',
    disablePersonSign: 'Personal sign 暂不支持使用硬件钱包签名',
    disableTypeSign: 'Typed sign 暂不支持使用硬件钱包签名',

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
    allowSwitchNetwork: '允许此网站切换网络？',
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
    accountDeleteWarning: '不能删除当前账户',
    accountHideWarning: '不能隐藏当前账户',
    lastAccountHideWarning: '在账户组中至少保留一个账户',
    ledgerTips: '这些账户只能在 {{network}} 上使用',

    // Network Management
    networkManagement: '网络管理',
    newRpcUrl: 'RPC URL',
    networkType: '网络类型',
    wrongRpcUrl: '不能获取到区块链 ID，请确认 RPC URL 是否正确',
    networkDeleteWarning: '不能删除当前网络',
    duplicateNetworkEndpoint: '重复的网络端点',
    urlWarning: '请填写 Http/Https 前缀',
    invalidRpcUrl: '无效的 RPC URL',
    resetDefaultRpcUrl: '恢复为默认 RPC',

    // Advanced Settings
    AdvancedSettings: '高级选项',
    priorityConnection: '优先连接',
    priorityConnectionDes: '在连接至 DApp 时，Fluent 将会作为默认钱包',
    showTestnet: '显示测试网络',
    showTestnetDes: '开启后，可在网络列表中展示测试网络',

    // About
    about: '关于',
    website: '官网',
    feedback: '反馈',
    docs: '文档',
    version: '版本号',

    // Authorized Website
    authorizedWebsite: '已授权的网站',
    noAuthorizedWebsite: '您没有授权任何网站',

    // Developer Mode
    developerMode: '开发者模式',
    compatibilityMode: '兼容模式',
    compatibilityDes:
      'Fluent 最终将会停止支持 ConfluxPortal 的 API。为了方便开发者测试，关掉开关将模拟 Fluent 不支持 ConfluxPortal API 的环境',

    // backup
    backupIdentity: '备份助记词',
    backupSeedDes: '请以正确的顺序备份助记词，不要在网络环境中存储或分享助记词',
    backupPk: '备份私钥',
    backupPkDes:
      '获得了私钥就等于拥有了钱包里的资产，请妥善保管，一单丢失就无法找回',
    confluxPathStandard: 'Conflux Core 钱包',
    confluxPathStandardDes: "由 Conflux 助记词路径 'm/503' 生成",
    ethereumPathStandard: 'Ethereum 钱包',
    ethereumPathStandardDes: "由 Ethereum 助记词路径 m/60' 生成",

    transferAmountExceedsAllowance: '转账金额超出限制',
    balanceIsNotEnough: '余额不足',
    gasFeeIsNotEnough: '不足以支付燃气费',
    contractError: '合约错误: ',
    invalidPasswordFromRpc: '密码错误',
    required: '请填写助记词',
    changeNetworkError: '切换网络发生错误',

    // hardware guard
    connectHardwareWallet: '连接硬件钱包',
    supportLedger: '现已支持 Ledger 硬件钱包',
    ledgerGuardDes: '如何在 Ledger 中添加 Conflux Core 的钱包？',
    followConnectLedgerSteps: '请根据以下步骤连接 Ledger',
    steps: '步骤 {{number}}',
    pluginHardwareWallet: '请将硬件钱包插入电脑的 USB 端口',
    selectLedgerApp: '打开 {{appName}} App',
    hardwareAccountTips: '添加的账户只能在 {{chain}} 上使用',
    ready: '开始连接',
    specifiedConnectedChain:
      '<Container><Content>连接 Ledger 在</Content><CurrentNetworkDisplay/></Container>',

    // connect hardware wallet
    searchHwWallet: '寻找钱包中',
    connectLedgerTips: '连接并解锁你的 Ledger，并在浏览器中授权连接请求',
    connectLedger: '连接你的 Ledger',
    connectLedgerDes: '点击下面的按钮开始授权连接',
    waitForPermission: '等待授权',
    connectFailed: '连接失败',
    retry: '重试',
    openLedgerApp: '打开 {{appName}} App',
    openLedgerAppDes: '在 Ledger 中选择并打开 {{appName}} App',
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
    copyError: '复制错误信息',

    // conflux confirm tx error
    txPoolFull: '交易池拥堵',
    nodeInCatchUpMode: '节点追块中',
    canNotRecoverPubKey: '无法恢复公钥',
    rlpIncorrectListLen: '无效的 RLP 列表长度',
    chainIdMismatch: '无法匹配 Chain ID',
    zeroGasPrice: '燃气价格不能为 0',
    tooDistantFuture: '随机数设置太大',
    duplicateTx: '重复的交易',
    epochHeightOutOfBound: '超出纪元高度范围',
    gasExceedsLimit: '超出燃气限制',
    tooStaleNonce: '随机数太旧了',
    replacedWithHigherGasPriceTx: '重复的交易',
    gasPriceTooLow: '燃气价格太低',
    wrongAddressType: '错误的地址类型',
    notEnoughBaseGas: '基本费用不足',
    unknownError: '未知错误',

    // ethereum confirm tx error
    replaceUnderpriced: '燃气太低',
    gasTooLow: '燃气太低',
    gasLimitReached: '达到燃气限制',
    oversizedData: 'Data 数据过大',
    nonceTooHigh: '随机数太大',
    nonceMax: '随机数太大',
    insufficientFunds: '余额不足',
    intrinsicGas: 'Intrinsic Gas 太低',
    txTypeNotSupported: '不支持此交易类型',
    feeCapVeryHigh: '燃气价格太高',
    feeCapTooLow: '燃气价格太低',
    tipAboveFeeCap: '小费 (Priority Fee) 错误',
    tipVeryHigh: '小费 (Priority Fee) 错误',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger 未连接',
    openExpandView: '在 Fluent 扩展视图连接硬件钱包',
    hwOpenApp: '点击确认之前，请确保已经打开 {{appName}} App',

    // error page
    errorTile: '错误',
    errorDes: '未知错误',
    routeError: '你访问的页面不存在',
    errorCode: '错误码',
    feedBackCode: '复制错误信息并反馈',
    fullNodeError: '无法连接到 RPC 节点',
    close: '关闭',
    reload: '重新加载',

    // address book & contacts
    addressBook: '地址簿',
    contacts: '联系人',
    recent: '最近',
    account: '我的账户',
    searchAddressNickname: '输入地址或名字查找',
    addedContactWarning: '该地址已经添加过了！',
    deleteContactTitle: '删除联系人',
    deleteContactContent: '确认删除此联系人？',
    name: '名称',
    address: '地址',
  },
}

export default zh
