const en = {
  translation: {
    faster: 'Faster',
    en: 'English',
    'zh-CN': '简体中文',
    back: 'Back',
    // welcome page
    hello: 'Hello',
    welcome: 'Welcome to Conflux network',
    create: 'Create',
    migration: 'One-Click Migration',
    welcomeBack: 'Welcome Back!',
    password: 'password',
    unlock: 'Unlock',
    // set password page
    setPWD: 'Set the password',
    enterPWD: 'Enter the password',
    enterPWDAgain: 'Enter the password again',
    rememberPWD: 'This password cannot be retrieved, please remember.',
    goBack: 'Back',
    // select create type
    newAccount: 'Create Account',
    createAccount: 'Create a new account',
    useExistingSeed: 'Use existing Seed Phrase',
    useExistingSeedDes: 'No need to backup again, use HD Wallet.',
    newSeedPhrase: 'New Seed Phrase',
    newSeedPhraseDes: 'Create a new Seed Phrase and Backup.',
    importExistingAccount: 'Import existing account',
    seedPhrase: 'Seed Phrase',
    seedPhraseDes: 'The Seed Phrase consists of words separated by spaces.',
    pKey: 'Private Key',
    pKeysDes: 'Enter the plaintext private key.',
    hardwareWallet: 'Hardware Wallet',
    // Import account with seed phrase
    seedImport: 'Import Seed Phrase',
    seedGroupName: 'Seed Phrase Group Name',
    seedImportPlaceholder:
      'The Seed Phrase consists of words separated by spaces. Separate each word entered by a space.',
    duplicateSeedError: 'This seed phrase already in your wallet.',
    // Import account with pk
    pKeyImport: 'Import Private Key',
    pKeyGroupName: 'Account name',
    pKeyImportPlaceholder: 'Type your Private Key here.',
    import: 'Import',
    duplicatePkError: 'This private key already in your wallet.',
    // use current seed phrase
    accountName: 'Account name',
    selectSeedPhrase: 'Select Seed Phrase',
    oneAccount: '1 Account',
    manyAccounts: '{{accountNum}} Accounts',
    // create seed phrase
    seedCreateTitle: 'Next, the Seed Phrase will be displayed',
    seedCreateContent:
      'Obtaining the Seed Phrase is equivalent to owning the assets in the wallet.<br/>Once the Seed Phrase is lost, it cannot be retrieved, please keep it properly',
    next: 'Next',
    // backup seed phrase
    backupSeedTitle: 'Backup Seed Phrase',
    backupSeedContent:
      'Please copy the Seed Phrase in order.<br/>Do not share and store Seed Phrase in a networked environment.',
    // confirm seed phrase
    confirmSeedTitle: 'Check Seed Phrase',
    confirmSeedContent:
      'Please click the Seed Phase in order to ensure correct backup.',
    confirmSeedError: 'Mistakes in Seed Phrase.',
    // set account
    myAccounts: 'My Accounts',
    addAccount: 'Add Account',
    // change network
    network: 'Network',
    mainnet: 'Mainnet',
    Testnet: 'Testnet',
    custom: 'Custom',
    // add token
    addToken: 'Add Token',
    searchToken: 'Search token name or contract address',
    searchResults: 'Search Results',
    noResult: 'No result',
    // home page
    send: 'Send',
    history: 'History',
    assets: 'Assets',
    noConnectedDapp: 'Not connected to current website',
    connected: 'Connected',
    authorizeCurrentAccount: 'Authorize {{currentAccount}}?',
    copiedSuccess: 'Copied success',
    needAuthTitle: 'Need authorization',
    needAuthContent:
      'This Account has not authorized to this site.<br/>Authorize this site to use {{accountName}} ？',
    disconnectTitle: 'Disconnect',
    disconnectContent: 'Disconnect this website?',
    no: 'No',
    yes: 'Yes',
    cancel: 'Cancel',
    disconnect: 'Disconnect',
    // dapp connect site
    connectSite: 'Connect to this Website?',
    selectNetwork: 'Which network want to use?',
    selectAuthorizedAccounts: 'Which accounts will be authorized?',
    selectAll: 'All',
    connect: 'Connect',
    chooseNetwork: 'Choose Network',
    // confirm add suggested token
    addSuggestedToken: 'Add suggested token',
    confirmAddSuggestedToken: 'Would you like to add this token?',
    //request signature
    signTypeMessage: 'Sign Type Message',
    signText: 'Sign Text',
    signThisMessage: 'Sign this message?',
    signThisText: 'Sign this text?',
    message: 'Message',
    sign: 'Sign',
    // Dapp add network
    addNetwork: 'Add Network',
    allowAddNetwork: 'Allow this site to add a network?',
    warningAddNetwork:
      'Do you trust this site? Fluent Wallet does not verify custom networks.',
    learnMore: 'Learn More',
    networkName: 'Network Name',
    networkUrl: 'Network URL',
    chainId: 'Chain ID',
    currencySymbol: 'Currency Symbol',
    optional: 'optional',
    blockExplorerUrl: 'Block Explorer URL',
    // Dapp switch network
    switchNetwork: 'Switch Network',
    allowSwitchNetwork: 'Allow this site to switch the network?',
    warningSwitchNetwork:
      'This will switch the selected network within Fluent to a previously added network',
    testnet: 'testnet',
    switch: 'Switch',
    //send transaction
    sendTransaction: 'Send Transaction',
    toAddressLabel: 'Send to Address',
    toAddressPlaceholder: 'Please enter the address',
    tokenAndAmount: 'Token & Amount',
    available: 'Available: ',
    max: 'MAX',
    gasFee: 'Gas fee',
    edit: 'Edit',
    sponsored: 'Sponsored',
    // choose token
    chooseToken: 'Choose Token',
    tokenList: 'Token list',
    noTxnWarning:
      'This address DOES NOT have any historical transactions, please double check',
    // edit gas fee
    editGasFeeControl: 'Edit fee control',
    gasPrice: 'Gas Price',
    gasLimit: 'Gas Limit',
    storageFee: 'Storage Fee',
    storageCollateralized: 'Storage Limit',
    totalFee: 'Total Fee',
    customNonce: 'Custom Nonce',
    save: 'Save',
    gasPriceErrMSg: 'Gas Price must be greater than 0 {{unit}}',
    gasLimitErrMsg: 'Gas limit must be at least {{gasUsed}}',
    nonceErr: 'Nonce can not be 0',
    // edit approve limit permissions
    editPermission: 'Edit Permission',
    spendLimitPermission: 'Spend limit permission',
    allowSpendDes:
      'Allow {{dapp}} to withdraw and spend up to the following amount:',
    proposedApprovalLimit: 'Proposed approval limit',
    proposedApprovalLimitDes: 'Spend limit request by {{dapp}}',
    customSpendLimit: 'Custom spend limit',
    customSpendLimitDes: 'Enter a max spend limit',
    set: 'Set',
    customLimitErr: 'Limit must be greater than 0 {{unit}}',
    // confirm transaction
    sendToken: 'Send Token',
    approveToken: 'Token Approve',
    signTransaction: 'Sign Transaction',
    toAddress: 'To Address',
    approveTo: 'Approve To',
    contract: 'Contract',
    allowLimit: 'Allow Limit',
    protocol: 'Protocol',
    action: 'Action',
    viewData: 'View Data',
    confirm: 'Confirm',
    createContract: 'Deploy contract',
    ledgerIsNotConnected: 'Leger is not connected',
    openExpandView: 'Open Fluent Expand View to Connect',
    balance: 'balance',
    hwOpenApp: 'Before clicking confirm, make sure the Conflux App is open.',
    // confirm hw Modal
    waitingForSign: 'Waiting for Sign',
    rejected: 'Rejected',
    waitingContent: 'Please confirm this transaction in your Ledger.',
    rejectedContent: 'Transaction has been rejected.',
    // transaction result
    transactionSubmit: 'Transaction Submitted/Signed',
    viewOnScan: 'View on Scan',
    ok: 'OK',
    // view data
    transactionDetails: 'Transaction Details',
    functionName: 'Function',
    hexData: 'Hex Data',
    // history
    activity: 'Activity',
    failed: 'Failed',
    executed: 'Executed',
    pending: 'Pending',
    sending: 'Sending',
    contractCreation: 'Contract Deployment',
    contractInteraction: 'Contract Interaction',
    unknown: 'Unknown',
    // account management
    accountManagement: 'Account Management',
    lock: 'Lock',
    enterPassword: 'Enter your password to continue',
    viewSeed: 'Reveal Secret Recovery Phrase',
    // backup seed
    backupIdentity: 'Backup Identity',
    backupSeedDes:
      'Please back up the Seed phrase in the correct order. Don’t share and store in networked environment.',
    backupPk: 'Backup Account',
    backupPkDes:
      'This is your private key. Acquiring means owning all assets. Please keep it safe. Once lost, it cannot be retrieved.',
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
    selectConfluxApp: 'Select and Open Conflux App.',
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
    openConfluxAppDes: 'Select and Open Conflux App in your Ledger device.',
    chooseAddress: 'Choose Address',
    hdPath: 'HD Path',
    chooseHwAddress: 'Choose the address you want to import.',
    capNext: 'NEXT',
    capPrev: 'PREV',
    adding: 'Adding',
    keepHwConnected: 'Please keep your ledger connected.',
    accountAdded: 'Account Added',
    importedHwAccount:
      'You can now access your Ledger wallet from within Fluent.Please return to the extension.',
    done: 'Done',
    refreshLater: 'Please try again later',
  },
}

export default en
