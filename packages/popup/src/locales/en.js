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
    copiedSuccess: 'Copied',
    invalidAddress: 'Please enter valid cfx address',
    invalidHexAddress: 'Please enter valid hex address',
    unChecksumAddress: 'Invalid address, make sure the letter case is correct',
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

    // - homepage
    send: 'Send',
    history: 'History',
    assets: 'Assets',
    crossSpace: 'Cross Space',

    // - homepage / dapp footer
    noConnectedDapp: 'Not connected to current website',
    connected: 'Connected',
    disconnect: 'Disconnect',
    disconnectTitle: 'Disconnect',
    disconnectContent: 'Disconnect this website?',

    // - homepage / dapp connect site popup
    connectSite: 'Connect to this Website?',
    permissionRequest: 'Permission Request',
    allowPermission: 'Allow these permissions for this site?',
    selectNetwork: 'Which network want to use?',
    selectAuthorizedAccounts: 'Authorized account',
    selectAll: 'All',
    connect: 'Connect',
    chooseNetwork: 'Choose Network',
    viewSelectedAddress: 'View selected account public address',
    viewMultiAddress: 'View selected account‘s multi-chain address',

    // - homepage / authorize single account
    authorizeCurrentAccount: 'Authorize {{currentAccount}}',
    needAuthTitle: 'Need authorization',
    needAuthContent:
      'This Account has not authorized to this site.<br/>Authorize this site to use {{accountName}} ？',

    // - homepage / account management / account list
    myAccounts: 'My Accounts',
    addAccount: 'Add Account',
    search: 'Search',

    // homepage / account management / create account
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

    // homepage / account management / create account / 1. use existing seed phrase
    accountName: 'Account Name',
    selectSeedPhrase: 'Select a Seed Phrase Group',

    // homepage / account management / create account / 2. new seed phrase
    seedGroupName: 'Seed Phrase Group Name',
    invalidWord: 'Invalid Word',
    seedCreateTitle: 'Next, the Seed Phrase will be displayed',
    seedCreateContent:
      'Obtaining the Seed Phrase is equivalent to owning the assets in the wallet.<br/>Once the Seed Phrase is lost, it cannot be retrieved, please keep it properly',

    // homepage / account management / create account / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Backup Seed Phrase',
    backupSeedContent:
      'Please copy the Seed Phrase in order.<br/>Do not share and store Seed Phrase in a networked environment.',
    confirmSeedTitle: 'Check Seed Phrase',
    confirmSeedContent:
      'Please click the Seed Phrase in order to ensure correct backup.',
    confirmSeedError: 'Mistakes in Seed Phrase.',

    // homepage / / account management / create account / 3. Import existing account
    seedImport: 'Import Seed Phrase',
    seedImportPlaceholder:
      'The Seed Phrase consists of words separated by spaces. Separate each word entered by a space.',
    duplicateSeedError: 'This seed Phrase already in your wallet.',
    invalidSeed: 'Invalid Seed Phrase, check again.',

    // homepage / / account management / create account / 4. Import account with private key
    pKeyImport: 'Import Private Key',
    pKeyImportPlaceholder: 'Type your Private Key here.',
    duplicatePkError: 'This Private Key already in your wallet.',
    invalidPrivateKey: 'Invalid Key, check again.',

    // - Network
    network: 'Network',
    mainnet: 'Mainnet',
    testnet: 'Testnet',
    custom: 'Custom',
    switchTestnetDisplay:
      '<Container><SwitchButton>Show/Hide</SwitchButton>test networks</Container>',

    // - add token
    addToken: 'Add Token',
    searchToken: 'Search by name or address',
    searchResults: 'Search Results',
    noResult: 'No result',
    remove: 'Remove',

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
    fr: 'Français (Communauté)',
    ru: 'Pусский (Cообщество)',
    uk: 'Українська (Cпільнота)',

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
    partSponsored: 'Partially Sponsored',

    // - Send Transaction / Error or Warning
    error: 'Error',
    warning: 'Warning',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFee: 'Edit Gas Fee',
    low: 'Low',
    medium: 'Market',
    high: 'Aggressive',
    suggested: 'Suggested',
    advanced: 'Advanced',
    gasCost: 'Est. Gas Cost',
    gasOption: 'Gas Option',
    gasFeeDetail: 'Gas Fee Detail',
    maxFeePerGas: 'Max Fee Per Gas',
    maxPriorityFeePerGas: 'Max Priority Fee Per Gas',
    maxFee: 'Max Fee',
    baseFee: 'Base Fee',
    priorityFee: 'Priority Fee',
    current: 'Current: ',
    twelveHour: '12hr: ',
    gasPrice: 'Gas Price',
    gasLimit: 'Gas Limit',
    storageFee: 'Storage Fee',
    storageLimit: 'Storage Limit',
    totalFee: 'Total Fee',
    customNonce: 'Custom Nonce',
    gasPriceErr: 'The minimum Gas Price is {{amount}} {{unit}}',
    maxPriorityFeePerGasLowErr:
      'The minimum typed value is {{amount}} {{unit}}',
    maxPriorityFeePerGasHighErr: 'Typed value <= "Max Fee Per Gas" is required',
    gasLimitMinErr: 'Gas Limit must be at least {{gasUsed}}',
    gasLimitMaxErr: 'Gas Limit must be at most {{gasMax}}',
    nonceErr: 'Nonce >= 0 is required',

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

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Edit Permission',
    spendLimitPermission: 'Spend Limit Permission',

    // approve allowance
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
    receive: 'Receive',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: 'Cancel Transaction',
    speedUp: 'Speed Up',
    suggestedGasPrice: 'Suggested Gas Price',
    inputGasPrice: 'Input Gas Price',
    spend: 'Spend',
    cancelTxDes:
      'Submitting this attempt does not guarantee your original transaction will be cancelled. If the cancellation attempt is successful, you will be charged the transaction gas fee above.',
    speedupTxDes:
      'Submitting this attempt does not guarantee your original transaction will be accelerated. If the acceleration attempt is successful, you will be charged the transaction gas fee above.',
    speedupTransaction: 'Speed up Transaction',
    submit: 'Submit',
    customGasPrice: 'Custom Gas Price',
    executedTx:
      'The transaction has been executed or finished.No action required.',
    amount: 'Amount',
    hash: 'Hash',
    nonce: 'Nonce',
    fromAddress: 'From Address',
    expeditedCancellation: 'Expedited Cancellation',

    // - request signature - 1. Sign Text
    signText: 'Sign Text',
    signThisText: 'Sign this Text?',
    disablePersonSign:
      'Personal sign with hardware wallet is not yet supported.',
    disableTypeSign: 'Typed sign with hardware wallet is not yet supported.',

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
    accountDeleteWarning: 'Can not delete current account.',
    accountHideWarning: 'Can not hide current account.',
    lastAccountHideWarning: 'Keep at least one account in this group.',
    ledgerTips: 'This account(s) can only be used on {{network}}.',

    // Network Management
    networkManagement: 'Network Management',
    newRpcUrl: 'RPC URL',
    networkType: 'Network Type',
    wrongRpcUrl: 'Could not fetch chain ID. Is your RPC URL correct?',
    networkDeleteWarning: 'Can not delete current network.',
    duplicateNetworkEndpoint: 'Duplicate network endpoint.',
    urlWarning: 'URLs require the appropriate HTTP/HTTPS prefix.',
    invalidRpcUrl: 'Invalid RPC URL',

    // Advanced Settings
    AdvancedSettings: 'Advanced Settings',
    priorityConnection: 'Priority Connection',
    priorityConnectionDes:
      'Fluent will be the first option when connecting to any dApp on EVM networks.',
    showTestnet: 'Show Testnet',
    showTestnetDes: 'Select this to show test networks in network list.',

    // About
    about: 'About',
    website: 'Website',
    feedback: 'Feedback',
    docs: 'Docs',
    version: 'Version',

    // Authorized Website
    authorizedWebsite: 'Authorized Websites',
    noAuthorizedWebsite: 'No website authorized',

    // Developer Mode
    developerMode: 'Developer Mode',
    compatibilityMode: 'Compatibility Mode',
    compatibilityDes:
      'Fluent will eventually stop supporting ConfluxPortal API.Turn off the switch to make Fluent incompatible with the ConfluxPortal API. Only for developers to test.',

    // backup
    backupIdentity: 'Backup Seed Phrase',
    backupSeedDes:
      'Please back up the Seed Phrase in the correct order. Don’t share and store in networked environment.',
    backupPk: 'Backup Account',
    backupPkDes:
      'This is your private key. Acquiring means owning all assets. Please keep it safe. Once lost, it cannot be retrieved.',
    confluxPathStandard: 'Conflux Core Wallet',
    confluxPathStandardDes: "Generated by Conflux path standard 'm/503'",
    ethereumPathStandard: 'Ethereum Wallet',
    ethereumPathStandardDes: "Generated by Ethereum path standard 'm/60'",

    transferAmountExceedsAllowance: 'Transfer amount exceeds allowance',
    balanceIsNotEnough: 'Insufficient balance',
    gasFeeIsNotEnough: 'Insufficient gas fee',
    contractError: 'Contract error: ',
    invalidPasswordFromRpc: 'Invalid password',
    required: 'Please type your seed phrase.',
    changeNetworkError: 'Change network error',

    // hardware guard
    connectHardwareWallet: 'Connect Hardware Wallet',
    supportLedger: 'Ledger is now supported.',
    ledgerGuardDes: 'How to create a Conflux Core Wallet in Ledger?',
    followConnectLedgerSteps:
      'Please follow the below steps to connect Ledger.',
    steps: 'Steps {{number}}',
    pluginHardwareWallet:
      'Plug your hardware wallet into your computer using the USB port.',
    selectLedgerApp: 'Select and open {{appName}} App.',
    hardwareAccountTips: 'Added account(s) is available on {{chain}}',
    ready: 'Ready',
    specifiedConnectedChain:
      '<Container><Content>Connect Ledger on</Content><CurrentNetworkDisplay/></Container>',

    // connect hardware wallet
    searchHwWallet: 'Searching for wallet',
    connectLedgerTips:
      'Connect your Ledger, make sure it is unlocked, and that you have approved permissions in your browser.',
    connectLedger: 'Connect your Ledger',
    connectLedgerDes: 'Check the button below to authorize the connection.',
    waitForPermission: 'Waiting for permission',
    connectFailed: 'Connection Failed',
    retry: 'Retry',
    openLedgerApp: 'Open {{appName}} App',
    openLedgerAppDes: 'Select and open {{appName}} App in your Ledger device.',
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
    copyError: 'Copy error code',

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
    gasPriceTooLow: 'Gas price too low',
    wrongAddressType: 'Wrong address type',
    notEnoughBaseGas: 'Not enough base gas',
    unknownError: 'Unknown Error',

    // ethereum confirm tx error
    replaceUnderpriced: 'Gas too low',
    gasTooLow: 'Gas too low',
    gasLimitReached: 'Gas limit reached',
    oversizedData: 'Data is oversized',
    nonceTooHigh: 'Nonce is too large',
    nonceMax: 'Nonce is too large',
    insufficientFunds: 'Insufficient funds',
    intrinsicGas: 'Intrinsic Gas too low',
    txTypeNotSupported: 'Unsupported transaction type',
    feeCapVeryHigh: 'Gas price too high',
    feeCapTooLow: 'Gas price too low',
    tipAboveFeeCap: 'Priority fee error',
    tipVeryHigh: 'Priority fee error',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger is not connected',
    openExpandView: 'Open Fluent expand view to connect',
    hwOpenApp:
      'Before clicking confirm, make sure the {{appName}} App is open.',

    // error page
    errorTile: 'Error',
    errorDes: 'hoops.something goes wrong...',
    routeError: 'Sorry! The page you’re looking for cannot be found.',
    errorCode: 'Error Code',
    feedBackCode: 'Copy code and feedback',
    fullNodeError: 'Unable to connect RPC node.',
    close: 'Close',
    reload: 'Reload',

    // address book & contacts
    addressBook: 'Address Book',
    contacts: 'Contacts',
    recent: 'Recent',
    account: 'Account',
    searchAddressNickname: 'Search address or nickname',
    addedContactWarning: 'This address has already been added!',
    deleteContactTitle: 'Confirm delete this contact',
    deleteContactContent: 'Do you want to delete this contact?',
    name: 'Name',
    address: 'Address',
  },
}

export default en
