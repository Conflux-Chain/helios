const ua = {
  translation: {
    // - common
    cancel: 'Відміна',
    create: 'Створити',
    next: 'Далі',
    import: 'Імпортувати',
    confirm: 'Підтвердити',
    save: 'Зберегти',
    ok: 'OK',
    sign: 'Підписати',
    switch: 'Перемкнути',
    no: 'Ні',
    yes: 'Так',
    copiedSuccess: 'Скопійовано',
    invalidAddress: 'Будь ласка, введіть дійсну адресу cfx',
    invalidHexAddress:
      'Будь ласка, введіть дійсну шістнадцятиричну (hex) адресу',
    unChecksumAddress: 'Невірна адреса, переконайтеся, що регістр правильний',
    protocol: 'Протокол',
    viewData: 'Перегляд даних',
    learnMore: 'Дізнатися детальніше',
    optional: 'Додатково',
    back: 'Назад',
    transactionDetails: 'Деталі транзакції',
    functionName: 'Функція',
    hexData: 'Шістнадцятиричні (hex) дані',
    add: 'Додати',
    notFilled: 'Не заповнено',
    unCaughtErrMsg: 'Щось пішло не так',

    // - home page
    send: 'Відправити',
    history: 'Історія',
    assets: 'Активи',
    crossSpace: 'Cross Space',

    // - homepage / 连接网站状态模块和切换连接弹窗模块
    noConnectedDapp: 'Не підключений до поточного веб-сайту',
    connected: 'Підключено',
    disconnect: 'Відключитися',
    disconnectTitle: 'Відключитися',
    disconnectContent: 'Відключитися від поточного веб-сайту?',

    // - homepage / dapp connect site 弹窗
    connectSite: 'Підключитися до цього веб-сайту?',
    selectNetwork: 'Яку мережу хочете використати?',
    selectAuthorizedAccounts: 'Авторизувати обліковий запис',
    selectAll: 'Вибрати все',
    connect: 'Підключитися',
    chooseNetwork: 'Вибрати мережу',

    // - homepage / 授权单个账号
    authorizeCurrentAccount: 'Авторизувати {{currentAccount}}',
    needAuthTitle: 'Потрібна авторизація',
    needAuthContent:
      'Цей обліковий запис не авторизований на цьому сайті.<br/>Дозволити використання цього веб-сайту  {{accountName}} ？',

    // - homepage / 账户管理 / 账户列表
    myAccounts: 'Мої облікові записи',
    addAccount: 'Додати обліковий запис',
    search: 'Пошук',

    // homepage / 账户管理 / 创建账户
    manyAccounts: '{{accountNum}} Облікові записи',
    oneAccount: '1 Обліковий запис',

    newAccount: 'Створити обліковий запис',
    createAccount: 'Створити новий обліковий запис',
    useExistingSeed: 'Використати існуючу секретну фразу',
    faster: 'Швидше',
    useExistingSeedDes:
      'Використайте HD Wallet, не треба знову робити резервну копію.',
    newSeedPhrase: 'Нова секретна фраза',
    newSeedPhraseDes: 'Створіть нову секретну фразу і резервну копію.',
    importExistingAccount: 'Імпорт облікового запису',
    seedPhrase: 'Секретна фраза',
    seedPhraseDes: 'Секретна фраза складається із слів, розділених пробiлами.',
    pKey: 'Приватний ключ',
    pKeysDes: 'Введіть приватний ключ в текстовому вигляді.',
    ledgerDes: 'Використайте свій Ledger гаманець.',

    // homepage / 账户管理 / 创建账户 / 1. use existing seed phraseу
    accountName: "Ім'я облікового запису",
    selectSeedPhrase: 'Виберіть секретну фразу',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase
    seedGroupName: "Секретна фраза Ім'я групи",
    invalidWord: 'Невірне слово',
    seedCreateTitle: 'Далі відображатиметься секретна фраза.',
    seedCreateContent:
      'Отримання секретної фрази еквівалентне володінню активами в гаманці.<br/>Якщо секретна фраза загублена, її неможливо відновити, зберігаєте її належним чином.',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Резервна секретна фраза',
    backupSeedContent:
      'Будь ласка, скопіюйте секретну фразу по порядку.<br/>Не передавайте і не зберігайте секретнную фразу в мережі.',
    confirmSeedTitle: 'Перевірити секретну фразу',
    confirmSeedContent:
      'Будь ласка кликніть на секретну фразу, щоб забезпечити правильне резервне копіювання.',
    confirmSeedError: 'Помилка в секретній фразі.',

    // homepage / 账户管理 / 创建账户 / 3. Import existing account
    seedImport: 'Імпорт секретної фрази',
    seedImportPlaceholder:
      'Секретна фраза складається із слів, розділених пробiлом. Розділяйте кожне введене слово пробiлом.',
    duplicateSeedError: 'Ця секретна фраза вже у вашому гаманці.',
    invalidSeed: 'Невірна секретна фраза, перевірте ще раз.',

    // homepage / 账户管理 / 创建账户 / 4. Import account with private key
    pKeyImport: 'Імпортувати привантый ключ',
    pKeyImportPlaceholder: 'Введіть свій приватний ключ тут.',
    duplicatePkError: 'Цей приватний ключ вже у вашому гаманці.',
    invalidPrivateKey: 'Невірний приватний ключ, перевірте ще раз.',

    // - Network
    network: 'Мережа',
    mainnet: 'Основна мережа',
    testnet: 'Тестова мережа',
    custom: 'Призначена для користувача мережа',

    // - add token
    addToken: 'Додати токен',
    searchToken: 'Пошук по імені або адресі',
    searchResults: 'Результати пошуку',
    noResult: 'Немає результату',
    willSupport1559: 'Підтримка EIP - 1559 найближчим часом.',
    remove: 'Видалити',

    // welcome page
    welcomeToConflux: 'Ласкаво просимо в Conflux Network',

    // - login page
    welcomeBack: 'З поверненням',
    welcome: 'Приєднуйтеся до Світу Web3',
    password: 'Введіть ваш пароль',
    unlock: 'Розблоковувати',
    passwordRulesWarning:
      'Використайте 8 ~ 128 символів з поєднанням букв і цифр.',
    en: 'English',
    zh: '简体中文',
    fr: 'Français (Communauté)',
    ru: 'Pусский (Cообщество)',
    uk: 'Українська (Cпільнота)',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: 'Відправити транзакцію',
    toAddressLabel: 'Відправити',
    toAddressPlaceholder: 'Будь ласка, введіть адресу',
    tokenAndAmount: 'Токен і сума',
    available: 'Доступно: ',
    max: 'Все',

    // - Send Transaction / choose token
    chooseToken: 'Виберіть токен',
    tokenList: 'Список токенiв',
    noTxnWarning:
      'Ця адреса НЕ МАЄ історії транзакцій, будь ласка, перевірте ще раз',

    // - Send Transaction / Sign Transaction
    signTransaction: 'Підтвердити транзакцію',
    sendToken: 'Відправити токен',
    toAddress: 'За адресою',
    gasFee: 'Плата за газ',
    edit: 'Редагувати',
    sponsored: 'Спонсорується',
    partSponsored: 'Частково спонсорується',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFeeControl: 'Регулятор газу',
    gasPrice: 'Вартість газу',
    gasLimit: 'Ліміт газу',
    storageFee: 'Вартість зберігання',
    storageCollateralized: 'Ліміт зберігання',
    totalFee: 'Підсумкова вартість',
    customNonce: 'Номер користувача (Nonce)',
    gasPriceErrMSg: 'Мінімальна ціна на газ складає {{amount}} {{unit}}',
    gasLimitMinErr: 'Ліміт газу має бути не менше {{gasUsed}}',
    gasLimitMaxErr: 'Ліміт газу має бути не більший {{gasMax}}',
    nonceErr: 'Номер (Nonce) Не може дорівнювати 0',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: 'Транзакція відправлена',
    viewOnScan: 'Проглянути тразакцию в ConfluxScan',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: 'Підтвердження токена',
    approveTo: 'Підтвердити по',
    contract: 'Контракт',
    allowLimit: 'Дозволити обмеження',
    action: 'Дія',
    balance: 'Баланс',
    createContract: 'Розгорнути контракт',

    // - Send Transaction / Sign Transaction / 3. token approve - view data
    // 此处展示内容为交易详情，在多种情况是相同的，不止是 token approve 这个场景，详见 common

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Дозвіл на редагування',
    spendLimitPermission: 'Дозвіл на ліміт витрат',

    // 允许操作的限额权限描述
    allowSpendDes:
      'Дозволити {{dapp}} виводити і оплачувати до наступної суми:',
    proposedApprovalLimit: 'Пропонований ліміт схвалення',
    proposedApprovalLimitDes: 'Запит ліміту витрат по {{dapp}}',
    customSpendLimit: ' Ліміт витрат користувача',
    customSpendLimitDes: 'Введіть максимальний ліміт витрат',
    customLimitErr: 'Ліміт має бути більший 0  {{unit}}',

    // - Send Transaction / - history
    activity: 'Активність',
    failed: 'Не вдалося',
    executed: 'Виконано',
    pending: 'В очікуванні',
    sending: 'Відправка',
    contractCreation: 'Розгортання контракту',
    contractInteraction: 'Взаємодія за контрактом',
    unknown: 'Невідомо',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: 'Відміна транзакції',
    suggestedGasPrice: 'Пропонована ціна на газ',
    inputGasPrice: 'Початкова ціна на газ',
    spend: 'Провести',
    cancelTxDes:
      'Відправка цієї заявки не гарантує, що ваша первинна транзакція буде скасована. Якщо процедура відміни буде успішною, з вас буде стягнута плата за газ, вказана вище.',
    speedupTxDes:
      'Відправка цієї заявки не гарантує, що ваша первинна транзакція буде прискорена. Якщо процедура виявиться успішною, з вас буде утримана плата за газ, вказана вище.',
    speedupTransaction: 'Прискорити транзакцію',
    submit: 'Підтвердити',
    customGasPrice: 'Користувальницька ціна на газ',
    executedTx: 'Транзакція виконана або завершена. Ніяких дій не потрібно.',

    // - request signature - 1. Sign Text
    signText: 'Підписати текст',
    signThisText: 'Підписати цей текст?',

    // - request signature - 2. Sign Message
    signThisMessage: 'Підписати це повідомлення?',
    signTypeMessage: 'Підписати написане повідомлення',
    message: 'Повідомлення',

    // - add network
    addNetwork: 'Додати мережу',
    allowAddNetwork: 'Дозволити цьому сайту додати мережу?',
    warningAddNetwork:
      'Ви довіряєте цьому сайту? Fluent Wallet не перевіряє призначені для користувача мережі.',
    networkName: "Ім'я мережі",
    networkUrl: 'URL мережі',
    chainId: 'Chain ID',
    currencySymbol: 'Символ валюти (Опцiонально)',
    blockExplorerUrl: 'Блокувати URL- адресу провідника (Опцiонально)',

    // - add suggested token
    addSuggestedToken: 'Додати запропонований токен',
    confirmAddSuggestedToken: 'Ви хочете додати цей токен?',

    // - Switch Network
    switchNetwork: 'Змінити мережу',
    allowSwitchNetwork: 'Дозволити цьому сайту змінити мережу?',
    warningSwitchNetwork:
      'В результаті вибрана мережа в Fluent Wallet буде замінена на раніше додану мережу',

    // - set password page
    setPWD: 'Встановіть пароль',
    enterPWD: 'Введіть пароль',
    enterPWDAgain: 'Введіть пароль ще раз',
    rememberPWD:
      "Цей пароль не може бути відновлений, будь ласка, запам'ятаєте його.",
    invalidPassword: 'Невірний пароль',
    invalidConfirmPassword: 'Пiдтвердженний пароль не відповідає.',
    // - welcome page
    hello: 'Привіт',

    // - migration
    migration: 'Перехід в один клiк',

    // account management
    accountManagement: 'Управління обліковим записом',
    lock: 'Блокування',
    enterPassword: 'Введіть пароль, щоб продовжити',
    viewSeed: 'Показати секретну фразу',
    hide: 'Приховати',
    delete: 'Видалити',
    groupDeleteWarning: 'Неможливо видалити поточну групу облікових записів.',
    accountDeleteWarning: 'Неможливо видалити поточний аккаунт.',
    accountHideWarning: 'Неможливо приховати поточний аккаунт.',
    lastAccountHideWarning: 'Збережіть хоча б один аккаунт.',
    ledgerTips: 'Цей акаунт(и) можна використовувати тільки в {{network}}.',

    // Network Management
    networkManagement: 'Управління мережею',
    newRpcUrl: 'RPC URL',
    networkType: 'Тип мережі',
    wrongRpcUrl: 'Не вдалося отримати Сhain ID. Ваш URL RPC коректний?',
    networkDeleteWarning: 'Неможливо видалити поточну мережу.',
    duplicateNetworkEndpoint: 'Дублікат кінцевої точки мережі.',
    urlWarning: 'URL- адреси вимагають відповідної приставки HTTP/HTTPS.',
    invalidRpcUrl: 'Невірний URL RPC',

    // Advanced Settings
    AdvancedSettings: 'Розширені налаштування',
    priorityConnection: 'Пріоритет підключення',
    priorityConnectionDes:
      'Fluent Wallet буде першою альтернативою при підключенні до будь-якому dApp в мережах EVM.',
    showTestnet: 'Показати тестову мережу',
    showTestnetDes:
      'Виберіть цей параметр, щоб показати тестові мережі в списку мереж.',

    // About
    about: 'Про проект',
    website: 'Веб-сайт',
    feedback: "Зворотний зв'язок",
    docs: 'Документи',
    version: 'Версія',

    // Authorized Website
    authorizedWebsite: 'Авторизовані веб-сайти',
    noAuthorizedWebsite: 'Веб-сайт не авторизований',

    // Developer Mode
    developerMode: 'Режим розробника',
    compatibilityMode: 'Режим сумісності',
    compatibilityDes:
      'Fluent Wallet з часом припинить підтримувати API ConfluxPortal. Вимкніть цей режим, щоб зробити Fluent Wallet несумісним з API ConfluxPortal. Тільки для розробників в цілях тестування.',

    // backup
    backupIdentity: 'Резервна секретна фраза',
    backupSeedDes:
      'Будь ласка, створіть резервну копію секретної фрази у вiрному порядку. Не діліться і не зберiгайте в мережевому оточенні.',
    backupPk: 'Резервний обліковий запис',
    backupPkDes:
      'Це ваш приватний ключ. Його отримання означає право власності на усі активи. Будь ласка, зберігаєте його у безпеці. Після втрати його неможливо відновити.',
    confluxPathStandard: 'Стандарт шляху Conflux',
    confluxPathStandardDes: "Генерується за стандартом шляху Conflux 'm/503'",
    ethereumPathStandard: 'Стандарт шляху Ethereum',
    ethereumPathStandardDes:
      "Генерується стандартом Conflux path standard 'm/60'",

    transferAmountExceedsAllowance: 'Сума переказу перевищує допустимий розмір',
    balanceIsNotEnough: 'Недостатній баланс',
    gasFeeIsNotEnough: 'Недостатня ціна за газ',
    contractError: 'Помилка в контракті: ',
    invalidPasswordFromRpc: 'Невірний пароль',
    required: 'Будь ласка, введіть вашу секретну фразу.',
    changeNetworkError: 'Помилка зміни мережі',

    // hardware guard
    connectHardwareWallet: 'Підключити апаратний гаманець',
    supportLedger: 'Ledger тепер підтримується.',
    ledgerGuardDes: 'Як створити гаманець Conflux Core в Ledger?',
    followConnectLedgerSteps: 'Для підключення Ledger виконаєте наступні дії.',
    steps: 'Шаги {{number}}',
    pluginHardwareWallet:
      "Підключіть апаратний гаманець до комп'ютера через порт USB.",
    enterPinCode: 'Введіть PIN- код.',
    selectLedgerApp: 'Select and open {{appName}} App in Ledger',
    ready: 'Готово',
    specifiedConnectedChain:
      '<Container><Content>Connect Ledger on</Content><CurrentNetworkDisplay/></Container>',

    // connect hardware wallet
    searchHwWallet: 'Пошук гаманця',
    connectLedgerTips:
      'Підключіть свій Ledger, переконайтеся, що він розблокований, і що у браузері встановлені дозволи.',
    connectLedger: 'Підключіть ваш Ledger',
    connectLedgerDes: "Натисніть на кнопку нижче для авторизації з'єднання.",
    waitForPermission: 'Очікування дозволу',
    connectFailed: "Не вдалося встановити з'єднання",
    retry: 'Повторити',
    openLedgerApp: 'Open {{appName}} App',
    openLedgerAppDes: 'Select and open {{appName}} App in your Ledger device.',
    chooseAddress: 'Виберіть адресу',
    hdPath: 'Шлях HD',
    chooseHwAddress: 'Виберіть адресу, яку ви хочете імпортувати :',
    capNext: 'Далі',
    capPrev: 'Назад',
    adding: 'Додавання',
    keepHwConnected: "Будь ласка, підтримуйте з'єднання з Ledger.",
    accountAdded: 'Обліковий запис доданий',
    importedHwAccount:
      'Тепер ви можете отримати доступ до свого гаманця Ledger з Fluent Wallet. Будь ласка, поверніться до розширення.',
    done: 'Виконано',
    refreshLater: 'Будь ласка, спробуйте ще раз пізніше',
    hardwareWallet: 'Апаратний гаманець',
    pKeyGroupName: "Ім'я облікового запису",

    // confirm hw Modal
    waitingForSign: 'Очікування входу',
    rejected: 'Відхилено',
    waitingContent: 'Будь ласка, підтвердіть цю операцію у вашому Ledger',
    rejectedContent: 'Транзакція була відхилена.',
    copyError: 'Копіювати код помилки',

    // conflux confirm tx error
    txPoolFull: 'Пул транзакцій заповнений',
    nodeInCatchUpMode: 'Вузол в режимі сихронизации',
    canNotRecoverPubKey: 'Неможливо відновити відкритий ключ',
    rlpIncorrectListLen: 'Невiрна інформація про розмір списку RLP',
    chainIdMismatch: 'Chain ID не співпадає',
    zeroGasPrice: 'Ціна на газ не може дорівнювати 0',
    tooDistantFuture: 'Номер (Nonce) занадто великий',
    duplicateTx: 'Повторна транзакція',
    epochHeightOutOfBound: 'Висота епохи за межами меж',
    gasExceedsLimit: 'Газ перевищує допустиму межу',
    tooStaleNonce: 'Занадто застарілий номер (Nonce)',
    replacedWithHigherGasPriceTx: 'Повторна транзакція',
    unknownError: 'Невідома помилка',

    // ethereum confirm tx error
    replaceUnderpriced: 'Занадто низька ціна на газ',
    gasTooLow: 'Занадто низька ціна на газ',
    gasLimitReached: 'Досягнута межа газу',
    oversizedData: 'Дані занадто великі',
    nonceTooHigh: 'Номер (Nonce) занадто великий',
    nonceMax: 'Номер (Nonce) занадто великий',
    insufficientFunds: 'Недостатньо коштiв',
    intrinsicGas: 'Внутрішній газ занадто низький',
    txTypeNotSupported: 'Непідтримуваний тип транзакції',
    feeCapVeryHigh: 'Занадто висока ціна газу',
    feeCapTooLow: 'Занадто низька ціна газу',
    tipAboveFeeCap: 'Помилка пріоритетної плати',
    tipVeryHigh: 'Помилка пріоритетної плати',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger не підключений',
    openExpandView: 'Відкрийте розширення Fluent Wallet для підключення',
    hwOpenApp:
      'Before clicking confirm, make sure the {{appName}} App is open.',

    // error page
    errorTile: 'Помилка',
    errorDes: 'Упс! Щось пішло не так',
    routeError: 'Вибачте! Сторінка, яку ви шукаєте, не існує.',
    errorCode: 'Код помилки',
    feedBackCode: "Скопіювати код і надати зворотний зв'язок",
    fullNodeError: 'Неможливо підключитися до вузла RPC.',
    close: 'Закрити',
    reload: 'Перезавантаження',
  },
}

export default ua
