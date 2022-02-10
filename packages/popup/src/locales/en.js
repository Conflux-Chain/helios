const en = {
  translation: {
    // - common
    cancel: 'Cancel',
    create: 'Create',
    next: 'Next',
    import: 'Import',
    confirm: 'Confirm',
    save: 'Save',
    ok: 'OK',
    sign: 'Sign',
    switch: 'Switch',
    no: 'No',
    yes: 'Yes',
    copiedSuccess: 'Copied success',
    invalidAddress: 'Please enter valid cfx address',
    invalidHexAddress: 'Please enter valid hex address',
    protocol: 'Protocol',
    viewData: 'View Data',
    learnMore: 'Learn More',
    optional: 'optional',
    back: 'Back',
    transactionDetails: 'Transaction Details',
    functionName: 'Function',
    hexData: 'Hex Data',
    add: 'Add',
    notFilled: 'Not filled',
    unCaughtErrMsg: 'something goes wrong',

    // - home page
    send: 'Send',
    history: 'History',
    assets: 'Assets',
    crossSpace: 'Cross Space',

    // - homepage / 连接网站状态模块和切换连接弹窗模块
    noConnectedDapp: 'Not connected to current website',
    connected: 'Connected',
    disconnect: 'Disconnect',
    disconnectTitle: 'Disconnect',
    disconnectContent: 'Disconnect this website?',

    // - homepage / dapp connect site 弹窗
    connectSite: 'Connect to this Website?',
    selectNetwork: 'Which network want to use?',
    selectAuthorizedAccounts: 'Which accounts will be authorized?',
    selectAll: 'All',
    connect: 'Connect',
    chooseNetwork: 'Choose Network',

    // - homepage / 授权单个账号
    authorizeCurrentAccount: 'Authorize {{currentAccount}}',
    needAuthTitle: 'Need authorization',
    needAuthContent:
      'This Account has not authorized to this site.<br/>Authorize this site to use {{accountName}} ？',

    // - homepage / 账户管理 / 账户列表
    myAccounts: 'My Accounts',
    addAccount: 'Add Account',

    // homepage / 账户管理 / 创建账户
    manyAccounts: '{{accountNum}} Accounts',
    oneAccount: '1 Account',

    newAccount: 'Create Account',
    createAccount: 'Create a new account',
    useExistingSeed: 'Use existing Seed Phrase',
    faster: 'Faster',
    useExistingSeedDes: 'Use HD Wallet, no need to backup again.',
    newSeedPhrase: 'New Seed Phrase',
    newSeedPhraseDes: 'Create a new Seed Phrase and Backup.',
    importExistingAccount: 'Import Account',
    seedPhrase: 'Seed Phrase',
    seedPhraseDes: 'The Seed Phrase consists of words separated by spaces.',
    pKey: 'Private Key',
    pKeysDes: 'Enter the plaintext private key.',
    ledgerDes: 'Use your Ledger wallet.',

    // homepage / 账户管理 / 创建账户 / 1. use existing seed phrase
    accountName: 'Account Name',
    selectSeedPhrase: 'Select a Seed Phrase Group',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase
    seedGroupName: 'Seed Phrase Group Name',
    invalidWord: 'Invalid Word',
    seedCreateTitle: 'Next, the Seed Phrase will be displayed',
    seedCreateContent:
      'Obtaining the Seed Phrase is equivalent to owning the assets in the wallet.<br/>Once the Seed Phrase is lost, it cannot be retrieved, please keep it properly',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Backup Seed Phrase',
    backupSeedContent:
      'Please copy the Seed Phrase in order.<br/>Do not share and store Seed Phrase in a networked environment.',
    confirmSeedTitle: 'Check Seed Phrase',
    confirmSeedContent:
      'Please click the Seed Phrase in order to ensure correct backup.',
    confirmSeedError: 'Mistakes in Seed Phrase.',

    // homepage / 账户管理 / 创建账户 / 3. Import existing account
    seedImport: 'Import Seed Phrase',
    seedImportPlaceholder:
      'The Seed Phrase consists of words separated by spaces. Separate each word entered by a space.',
    duplicateSeedError: 'This seed Phrase already in your wallet.',
    invalidSeed: 'Invalid Seed Phrase, check again.',

    // homepage / 账户管理 / 创建账户 / 4. Import account with private key
    pKeyImport: 'Import Private Key',
    pKeyImportPlaceholder: 'Type your Private Key here.',
    duplicatePkError: 'This Private Key already in your wallet.',
    invalidPrivateKey: 'Invalid Key, check again.',

    // - Network
    network: 'Network',
    mainnet: 'Mainnet',
    testnet: 'Testnet',
    custom: 'Custom',

    // - add token
    addToken: 'Add Token',
    searchToken: 'Search by name or address',
    searchResults: 'Search Results',
    noResult: 'No result',

    // welcome page
    welcomeToConflux: 'Welcome to Conflux Network',

    // - login page
    welcomeBack: 'Welcome Back',
    welcome: 'Enter the Web3 world',
    password: 'Enter your password',
    unlock: 'Unlock',
    passwordRulesWarning:
      'Use 8 ~ 128 characters with a mix of letters & numbers.',
    en: 'English',
    zh: '简体中文',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: 'Send Transaction',
    toAddressLabel: 'Send To',
    toAddressPlaceholder: 'Please enter an address',
    tokenAndAmount: 'Token and Amount',
    available: 'Available: ',
    max: 'MAX',

    // - Send Transaction / choose token
    chooseToken: 'Choose Token',
    tokenList: 'Token list',
    noTxnWarning:
      'This address DOES NOT have any historical transactions, please double check',

    // - Send Transaction / Sign Transaction
    signTransaction: 'Sign Transaction',
    sendToken: 'Send Token',
    toAddress: 'To Address',
    gasFee: 'Gas fee',
    edit: 'Edit',
    sponsored: 'Sponsored',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFeeControl: 'Gas controller',
    gasPrice: 'Gas Price',
    gasLimit: 'Gas Limit',
    storageFee: 'Storage Fee',
    storageCollateralized: 'Storage Limit',
    totalFee: 'Total Fee',
    customNonce: 'Custom Nonce',
    gasPriceErrMSg: 'The minimum Gas Price is 1 {{unit}}',
    gasLimitMinErr: 'Gas Limit must be at least {{gasUsed}}',
    gasLimitMaxErr: 'Gas Limit must be at most {{gasMax}}',
    nonceErr: 'Nonce can not be 0',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: 'Transaction Submitted',
    viewOnScan: 'View on Scan',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: 'Token Approval',
    approveTo: 'Approve To',
    contract: 'Contract',
    allowLimit: 'Allow Limit',
    action: 'Action',
    balance: 'Balance',
    createContract: 'Deploy Contract',

    // - Send Transaction / Sign Transaction / 3. token approve - view data
    // 此处展示内容为交易详情，在多种情况是相同的，不止是 token approve 这个场景，详见 common

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Edit Permission',
    spendLimitPermission: 'Spend Limit Permission',

    // 允许操作的限额权限描述
    allowSpendDes:
      'Allow {{dapp}} to withdraw and spend up to the following amount:',
    proposedApprovalLimit: 'Proposed approval limit',
    proposedApprovalLimitDes: 'Spend limit request by {{dapp}}',
    customSpendLimit: 'Custom spend limit',
    customSpendLimitDes: 'Enter a max spend limit',
    customLimitErr: 'Limit must be greater than 0 {{unit}}',

    // - Send Transaction / - history
    activity: 'Activity',
    failed: 'Failed',
    executed: 'Executed',
    pending: 'Pending',
    sending: 'Sending',
    contractCreation: 'Contract Deployment',
    contractInteraction: 'Contract Interaction',
    unknown: 'Unknown',

    // - request signature - 1. Sign Text
    signText: 'Sign Text',
    signThisText: 'Sign this Text?',

    // - request signature - 2. Sign Message
    signThisMessage: 'Sign this Message?',
    signTypeMessage: 'Sign Type Message',
    message: 'Message',

    // - add network
    addNetwork: 'Add Network',
    allowAddNetwork: 'Allow this site to add a network?',
    warningAddNetwork:
      'Do you trust this site? Fluent Wallet does not verify custom networks.',
    networkName: 'Network Name',
    networkUrl: 'Network URL',
    chainId: 'Chain ID',
    currencySymbol: 'Currency Symbol (Optional)',
    blockExplorerUrl: 'Block Explorer URL (Optional)',

    // - add suggested token
    addSuggestedToken: 'Add suggested token',
    confirmAddSuggestedToken: 'Would you like to add this token?',

    // - Switch Network
    switchNetwork: 'Switch Network',
    allowSwitchNetwork: 'Allow this site to switch the network?',
    warningSwitchNetwork:
      'This will switch the selected network within Fluent to a previously added network',

    // - set password page
    setPWD: 'Set the password',
    enterPWD: 'Enter the password',
    enterPWDAgain: 'Enter the password again',
    rememberPWD: 'This password cannot be retrieved, please remember.',
    invalidPassword: 'Wrong Password.',
    invalidConfirmPassword: 'Confirm password does not match.',
    // - welcome page
    hello: 'Hello',

    // - migration
    migration: 'One-Click Migration',

    // account management
    accountManagement: 'Account Management',
    lock: 'Lock',
    enterPassword: 'Enter your password to continue',
    viewSeed: 'Reveal secret Seed Phrase',
    hide: 'Hide',
    delete: 'Delete',
    groupDeleteWarning: 'Can not delete current account group.',
    accountHideWarning: 'Can not hide current account.',

    // Network Management
    networkManagement: 'Network Management',
    newRpcUrl: 'RPC URL',
    networkType: 'Network Type',
    wrongRpcUrl: 'Could not fetch chain ID. Is your RPC URL correct?',
    networkDeleteWarning: 'Can not delete current network.',
    duplicateNetworkEndpoint: 'Duplicate network endpoint.',
    urlWarning: 'URLs require the appropriate HTTP/HTTPS prefix.',
    invalidRpcUrl: 'Invalid RPC URL',

    // About
    about: 'About',
    website: 'Web Site',
    feedback: 'Feedback',
    docs: 'Docs',
    version: 'Version',

    // Developer Mode
    developerMode: 'Developer Mode',
    compatibilityMode: 'Compatibility Mode',
    compatibilityDes:
      'Fluent will eventually stop supporting ConfluxPortal API.Turn off the switch to make Fluent incompatible with the ConfluxPortal API. Only for developers to test.',

    // backup seed
    backupIdentity: 'Backup Seed Phrase',
    backupSeedDes:
      'Please back up the Seed Phrase in the correct order. Don’t share and store in networked environment.',
    backupPk: 'Backup Account',
    backupPkDes:
      'This is your private key. Acquiring means owning all assets. Please keep it safe. Once lost, it cannot be retrieved.',

    transferAmountExceedsAllowance: 'Transfer amount exceeds allowance',
    balanceIsNotEnough: 'Insufficient balance',
    gasFeeIsNotEnough: 'Insufficient gas fee',
    contractError: 'Contract error: ',
    addressHasBeenChanged: 'Address has been changed',
    invalidPasswordFromRpc: 'Invalid password',
    required: 'Please type your seed phrase.',
    changeNetworkError: 'Change network error',

    // hardware guard
    connectHardwareWallet: 'Connect Hardware Wallet',
    supportLedger: 'Ledger is now supported.',
    ledgerGuardDes: 'How to create a Conflux Wallet in Ledger?',
    followConnectLedgerSteps:
      'Please follow the below steps to connect Ledger.',
    steps: 'Steps {{number}}',
    pluginHardwareWallet:
      'Plug your hardware wallet into your computer using the USB port.',
    enterPinCode: 'Enter your PIN code.',
    selectConfluxApp: 'Select and open Conflux App.',
    ready: 'Ready',

    // connect hardware wallet
    searchHwWallet: 'Searching for wallet',
    connectLedgerTips:
      'Connect your Ledger, make sure it is unlocked, and that you have approved permissions in your browser.',
    connectLedger: 'Connect your Ledger',
    connectLedgerDes: 'Check the button below to authorize the connection.',
    waitForPermission: 'Waiting for permission',
    connectFailed: 'Connection Failed',
    retry: 'Retry',
    openConfluxApp: 'Open the Conflux App',
    openConfluxAppDes: 'Select and open Conflux App in your Ledger device.',
    chooseAddress: 'Choose Address',
    hdPath: 'HD Path',
    chooseHwAddress: 'Choose the address you want to import:',
    capNext: 'NEXT',
    capPrev: 'PREV',
    adding: 'Adding',
    keepHwConnected: 'Please keep your ledger connected.',
    accountAdded: 'Account Added',
    importedHwAccount:
      'You can now access your Ledger wallet from within Fluent. Please return to the extension.',
    done: 'Done',
    refreshLater: 'Please try again later',
    hardwareWallet: 'Hardware Wallet',
    pKeyGroupName: 'Account name',

    // confirm hw Modal
    waitingForSign: 'Waiting for Sign',
    rejected: 'Rejected',
    waitingContent: 'Please confirm this transaction in your Ledger.',
    rejectedContent: 'Transaction has been rejected.',

    // conflux confirm tx error
    txPoolFull: 'Transaction pool is full',
    nodeInCatchUpMode: 'Node in catch-up mode',
    canNotRecoverPubKey: 'Unable to recover public key',
    rlpIncorrectListLen: 'Incorrect RLP list length',
    chainIdMismatch: 'Chain ID does not match',
    zeroGasPrice: 'Gas price cannot be 0',
    tooDistantFuture: 'Nonce is too large',
    duplicateTx: 'Duplicate Transaction',
    epochHeightOutOfBound: 'Epoch height out of bound',
    gasExceedsLimit: 'Gas exceeds limit',
    tooStaleNonce: 'Too Stale Nonce',
    replacedWithHigherGasPriceTx: 'Duplicate Transaction',
    unknownError: 'Unknown Error',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger is not connected',
    openExpandView: 'Open Fluent expand view to connect',
    hwOpenApp: 'Before clicking confirm, make sure the Conflux App is open.',

    // error page
    errorTile: 'Error',
    errorDes: 'hoops.something goes wrong...',
    routeError: 'Sorry! The page you’re looking for cannot be found.',
    errorCode: 'Error Code',
    feedBackCode: 'Copy code and feedback',
    fullNodeError: 'Unable to connect RPC node.',
  },
}

export default en
