const ru = {
  translation: {
    // - common
    cancel: 'Отмена',
    create: 'Создать',
    next: 'Далее',
    import: 'Импортировать',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    ok: 'OK',
    sign: 'Подписать',
    switch: 'Переключить',
    no: 'Нет',
    yes: 'Да',
    copiedSuccess: 'Скопировано',
    invalidAddress: 'Пожалуйста, введите действительный адрес cfx',
    invalidHexAddress:
      'Пожалуйста, введите действительный шестнадцатеричный (hex) адрес',
    unChecksumAddress: 'Неверный адрес, убедитесь, что регистр правильный',
    protocol: 'Протокол',
    viewData: 'Просмотр данных',
    learnMore: 'Узнать подробнее',
    optional: 'Дополнительно',
    back: 'Назад',
    transactionDetails: 'Детали транзакции',
    functionName: 'Функция',
    hexData: 'Шестнадцатеричные (hex) данные',
    add: 'Добавить',
    notFilled: 'Не заполнено',
    unCaughtErrMsg: 'Что-то пошло не так',

    // - homepage
    send: 'Отправить',
    history: 'История',
    assets: 'Активы',
    crossSpace: 'Cross Space',

    // - homepage / dapp footer
    noConnectedDapp: 'Не подключен к текущему веб-сайту',
    connected: 'Подключно',
    disconnect: 'Отключиться',
    disconnectTitle: 'Отключиться',
    disconnectContent: 'Отключиться от текущего веб-сайта?',

    // - homepage / dapp connect site popup
    connectSite: 'Подключиться к этому веб-сайту?',
    permissionRequest: 'Permission Request',
    allowPermission: 'Allow these permissions for this site?',
    selectNetwork: 'Какую сеть хотите использовать?',
    selectAuthorizedAccounts: 'Авторизовать учетную запись',
    selectAll: 'Выбрать все',
    connect: 'Подключиться',
    chooseNetwork: 'Выбрать сеть',
    viewSelectedAddress: 'View selected account public address',
    viewMultiAddress: 'View selected account‘s multi-chain address',

    // - homepage / authorize single account
    authorizeCurrentAccount: 'Авторизировать {{currentAccount}}',
    needAuthTitle: 'Нужна авторизация',
    needAuthContent:
      'Эта учетная запись не авторизована на этом сайте.<br/>Разрешить использование этого веб-сайта {{accountName}} ？',

    // - homepage / account management / account list
    myAccounts: 'Мои учетные записи',
    addAccount: 'Добавить учетную запись',
    search: 'Поиск',

    // homepage / account management / create account
    manyAccounts: '{{accountNum}} Учетные записи',
    oneAccount: '1 Учетная запись',

    newAccount: 'Создать учетную запись',
    createAccount: 'Создать новую учетную запись',
    useExistingSeed: 'Использовать существующую секретную фразу',
    faster: 'Быстрее',
    useExistingSeedDes:
      'Используйте HD Wallet, не нужно снова делать резервную копию.',
    newSeedPhrase: 'Новая секретная фраза',
    newSeedPhraseDes: 'Создайте новую секретную фразу и резервную копию.',
    importExistingAccount: 'Импорт учетной записи',
    seedPhrase: 'Секретная фраза',
    seedPhraseDes: 'Секретная фраза состоит из слов, разделенных пробелами.',
    pKey: 'Приватный ключ',
    pKeysDes: 'Введите приватный ключ в текстовом виде.',
    ledgerDes: 'Используйте свой Ledger кошелек.',

    // homepage / account management / create account / 1. use existing seed phraseу
    accountName: 'Имя учетной записи',
    selectSeedPhrase: 'Выберите секретную фразу',

    // homepage / account management / create account / 2. new seed phrase
    seedGroupName: 'Секретная фраза Имя группы',
    invalidWord: 'Неверное слово',
    seedCreateTitle: 'Далее будет отображаться секретная фраза.',
    seedCreateContent:
      'Получение секретной фразы эквивалентно владению активами в кошельке.<br/>Если секретная фраза утеряна, ее невозможно восстановить, храните ее должным образом.',

    // homepage / account management / create account / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Резервная секретная фраза',
    backupSeedContent:
      'Пожалуйста, скопируйте секретную фразу по порядку.<br/>Не передавайте и не храните секретнную фразу в сети.',
    confirmSeedTitle: 'Проверить секретную фразу',
    confirmSeedContent:
      'Пожалуйста кликните на секретную фразу, чтобы обеспечить правильное резервное копирование.',
    confirmSeedError: 'Ошибка в секретной фразе.',

    // homepage / account management / create account / 3. Import existing account
    seedImport: 'Импорт секретной фразы',
    seedImportPlaceholder:
      'Секретная фраза состоит из слов, разделенных пробелами. Разделяйте каждое введенное слово пробелом.',
    duplicateSeedError: 'Эта секретная фраза уже в вашем кошельке.',
    invalidSeed: 'Неверная секретная фраза, проверьте еще раз.',

    // homepage / account management / create account / 4. Import account with private key
    pKeyImport: 'Импортировать привантый ключ',
    pKeyImportPlaceholder: 'Введите свой приватный ключ здесь.',
    duplicatePkError: 'Этот приватный ключ уже в вашем кошельке.',
    invalidPrivateKey: 'Неверный приватный ключ, проверьте еще раз.',

    // - Network
    network: 'Сеть',
    mainnet: 'Основная сеть',
    testnet: 'Тестовая сеть',
    custom: 'Пользовательская сеть',

    // - add token
    addToken: 'Добавить токен',
    searchToken: 'Поиск по имени или адресу',
    searchResults: 'Результаты поиска',
    noResult: 'Нет результата',
    remove: 'Удалить',

    // welcome page
    welcomeToConflux: 'Добро пожаловать в Conflux Network',

    // - login page
    welcomeBack: 'С возвращением',
    welcome: 'Присоединяйтесь к Миру Web3',
    password: 'Введите ваш пароль',
    unlock: 'Разблокировать',
    passwordRulesWarning:
      'Используйте 8 ~ 128 символов с сочетанием букв и цифр.',
    en: 'English',
    zh: '简体中文',
    fr: 'Français (Communauté)',
    ru: 'Pусский (Cообщество)',
    uk: 'Українська (Cпільнота)',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: 'Отправить транзакцию',
    toAddressLabel: 'Отправить',
    toAddressPlaceholder: 'Пожалуйста, введите адрес',
    tokenAndAmount: 'Токен и сумма',
    available: 'Доступно: ',
    max: 'Все',

    // - Send Transaction / choose token
    chooseToken: 'Выберите токен',
    tokenList: 'Список токенов',
    noTxnWarning:
      'Этот адрес НЕ ИМЕЕТ истории транзакций, пожалуйста, проверьте еще раз',

    // - Send Transaction / Sign Transaction
    signTransaction: 'Подтвердить транзакцию',
    sendToken: 'Отправить токен',
    toAddress: 'По адресу',
    gasFee: 'Плата за газ',
    edit: 'Редактировать',
    sponsored: 'Спонсируется',
    partSponsored: 'Частично спонсируется',

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
    gasPrice: 'Стоимость газа',
    gasLimit: 'Лимит газа',
    storageFee: 'Стоимость хранения',
    storageLimit: 'Лимит хранения',
    totalFee: 'Итоговая стоимость',
    customNonce: 'Пользовательский номер (Nonce)',
    gasPriceErr: 'Минимальная цена на газ составляет {{amount}} {{unit}}',
    maxPriorityFeePerGasLowErr:
      'The minimum typed value is {{amount}} {{unit}}',
    maxPriorityFeePerGasHighErr: 'Typed value <= "Max Fee Per Gas" is required',
    gasLimitMinErr: 'Лимит газа должен быть не менее {{gasUsed}}',
    gasLimitMaxErr: 'Лимит газа должен быть не более {{gasMax}}',
    nonceErr: 'Nonce >= 0 is required',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: 'Транзакция отправлена',
    viewOnScan: 'Просмотреть тразакцию в ConfluxScan',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: 'Подтверждение токена',
    approveTo: 'Подтвердить по',
    contract: 'Контракт',
    allowLimit: 'Разрешить ограничение',
    action: 'Действие',
    balance: 'Баланс',
    createContract: 'Развернуть контракт',

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Разрешение на редактирование',
    spendLimitPermission: 'Разрешение на лимит расходов',

    // approve allowance
    allowSpendDes:
      'Разрешить {{dapp}} выводить и оплачивать до следующей суммы:',
    proposedApprovalLimit: 'Предлагаемый лимит одобрения',
    proposedApprovalLimitDes: 'Запрос лимита расходов по {{dapp}}',
    customSpendLimit: 'Пользовательский лимит расходов',
    customSpendLimitDes: 'Введите максимальный лимит расходов',
    customLimitErr: 'Лимит должен быть больше 0  {{unit}}',

    // - Send Transaction / - history
    activity: 'Активность',
    failed: 'Не удалось',
    executed: 'Выполнено',
    pending: 'В ожидании',
    sending: 'Отправка',
    contractCreation: 'Развертывание контракта',
    contractInteraction: 'Взаимодействие по контракту',
    unknown: 'Неизвестно',
    receive: 'Receive',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: 'Отмена транзакции',
    speedUp: 'Speed Up',
    suggestedGasPrice: 'Предлагаемая цена на газ',
    inputGasPrice: 'Исходная цена на газ',
    spend: 'Провести',
    cancelTxDes:
      'Отправка этой заявки не гарантирует, что ваша первоначальная транзакция будет отменена. Если процедура отмены будет успешной, с вас будет взыскана плата за газ, указанная выше.',
    speedupTxDes:
      'Отправка этой заявки не гарантирует, что ваша первоначальная транзакция будет ускорена. Если процедура окажется успешной, с вас будет удержана плата за газ, указанная выше.',
    speedupTransaction: 'Ускорить транзакцию',
    submit: 'Подтвердить',
    customGasPrice: 'Пользовательская цена на газ',
    executedTx:
      'Транзакция выполнена или завершена. Никаких действий не требуется.',
    amount: 'Amount',
    hash: 'Hash',
    nonce: 'Nonce',
    fromAddress: 'From Address',

    // - request signature - 1. Sign Text
    signText: 'Подписать текст',
    signThisText: 'Подписать этот текст?',
    disablePersonSign:
      'Personal sign with hardware wallet is not yet supported.',
    disableTypeSign: 'Typed sign with hardware wallet is not yet supported.',

    // - request signature - 2. Sign Message
    signThisMessage: 'Подписать это сообщение?',
    signTypeMessage: 'Подписать написанное сообщение',
    message: 'Сообщение',

    // - add network
    addNetwork: 'Добавить сеть',
    allowAddNetwork: 'Разрешить этому сайту добавить сеть?',
    warningAddNetwork:
      'Вы доверяете этому сайту? Fluent Wallet не проверяет пользовательские сети.',
    networkName: 'Имя сети',
    networkUrl: 'URL сети',
    chainId: 'Chain ID',
    currencySymbol: 'Символ валюты (Опционально)',
    blockExplorerUrl: 'Блокировать URL-адрес проводника (Опционально)',

    // - add suggested token
    addSuggestedToken: 'Добавить предложенный токен',
    confirmAddSuggestedToken: 'Вы хотите добавить этот токен?',

    // - Switch Network
    switchNetwork: 'Сменить сеть',
    allowSwitchNetwork: 'Разрешить этому сайту сменить сеть?',
    warningSwitchNetwork:
      'В результате выбранная сеть в Fluent Wallet будет заменена на ранее добавленную сеть',

    // - set password page
    setPWD: 'Установите пароль',
    enterPWD: 'Введите пароль',
    enterPWDAgain: 'Введите пароль еще раз',
    rememberPWD:
      'Этот пароль не может быть восстановлен, пожалуйста, запомните его.',
    invalidPassword: 'Неверный пароль',
    invalidConfirmPassword: 'Подтвержденый пароль не соответствует.',
    // - welcome page
    hello: 'Привет',

    // - migration
    migration: 'Переход в один клик',

    // account management
    accountManagement: 'Управление учетной записью',
    lock: 'Блокировка',
    enterPassword: 'Введите пароль, чтобы продолжить',
    viewSeed: 'Показать секретную фразу',
    hide: 'Скрыть',
    delete: 'Удалить',
    groupDeleteWarning: 'Невозможно удалить текущую группу учетных записей.',
    accountDeleteWarning: 'Невозможно удалить текущий аккаунт.',
    accountHideWarning: 'Невозможно скрыть текущий аккаунт.',
    lastAccountHideWarning: 'Keep at least one account in this group.',
    ledgerTips: 'Этот аккаунт(ы) можно использовать только в {{network}}.',

    // Network Management
    networkManagement: 'Управление сетью',
    newRpcUrl: 'RPC URL',
    networkType: 'Тип сети',
    wrongRpcUrl: 'Не удалось получить Сhain ID. Ваш URL RPC корректен?',
    networkDeleteWarning: 'Невозможно удалить текущую сеть.',
    duplicateNetworkEndpoint: 'Дубликат конечной точки сети.',
    urlWarning: 'URL-адреса требуют соответствующей приставки HTTP/HTTPS.',
    invalidRpcUrl: 'Неверный URL RPC',

    // Advanced Settings
    AdvancedSettings: 'Расширенные настройки',
    priorityConnection: 'Приоритет подключения',
    priorityConnectionDes:
      'Fluent Wallet будет первой альтернативой при подключении к любому dApp в сетях EVM.',
    showTestnet: 'Показать тестовую сеть',
    showTestnetDes:
      'Выберите этот параметр, чтобы показать тестовые сети в списке сетей.',

    // About
    about: 'О проекте',
    website: 'Веб-сайт',
    feedback: 'Обратная связь',
    docs: 'Документы',
    version: 'Версия',

    // Authorized Website
    authorizedWebsite: 'Авторизованные веб-сайты',
    noAuthorizedWebsite: 'Веб-сайт не авторизован',

    // Developer Mode
    developerMode: 'Режим разработчика',
    compatibilityMode: 'Режим совместимости',
    compatibilityDes:
      'Fluent Wallet со временем перестанет поддерживать API ConfluxPortal. Выключите это режим, чтобы сделать Fluent Wallet несовместимым с API ConfluxPortal. Только для разработчиков в целях тестирования.',

    // backup
    backupIdentity: 'Резервная секретная фраза',
    backupSeedDes:
      'Пожалуйста, создайте резервную копию секретной фразы в правильном порядке. Не делитесь и не храните в сетевом окружении.',
    backupPk: 'Резервная учетная запись',
    backupPkDes:
      'Это ваш приватный ключ. Его получение означает право собственности на все активы. Пожалуйста, храните его в безопасности. После утери его невозможно восстановить.',
    confluxPathStandard: 'Conflux Core Wallet',
    confluxPathStandardDes: "Генерируется по стандарту пути Conflux 'm/503''",
    ethereumPathStandard: 'Ethereum Wallet',
    ethereumPathStandardDes: "Generated by Ethereum path standard 'm/60'",

    transferAmountExceedsAllowance:
      'Сумма перевода превышает допустимый размер',
    balanceIsNotEnough: 'Недостаточный баланс',
    gasFeeIsNotEnough: 'Недостаточная цена за газ',
    contractError: 'Ошибка в контракте: ',
    invalidPasswordFromRpc: 'Неверный пароль',
    required: 'Пожалуйста, введите вашу секретную фразу.',
    changeNetworkError: 'Ошибка изменения сети',

    // hardware guard
    connectHardwareWallet: 'Подключить аппаратный кошелек',
    supportLedger: 'Ledger теперь поддерживается..',
    ledgerGuardDes: 'Как создать кошелек Conflux Core в Ledger?',
    followConnectLedgerSteps:
      'Для подключения Ledger выполните следующие действия.',
    steps: 'Шаги {{number}}',
    pluginHardwareWallet:
      'Подключите аппаратный кошелек к компьютеру через порт USB.',
    selectLedgerApp: 'Select and open {{appName}} App.',
    hardwareAccountTips: 'Added account(s) is available on {{chain}}',
    ready: 'Готово',
    specifiedConnectedChain:
      '<Container><Content>Connect Ledger on</Content><CurrentNetworkDisplay/></Container>',

    // connect hardware wallet
    searchHwWallet: 'Поиск кошелька',
    connectLedgerTips:
      'Подключите свой Ledger, убедитесь, что он разблокирован, и что в браузере установлены разрешения.',
    connectLedger: 'Подключите ваш Ledger',
    connectLedgerDes: 'Нажмите на кнопку ниже для авторизации соединения.',
    waitForPermission: 'Ожидание разрешения',
    connectFailed: 'Не удалось установить соединение',
    retry: 'Повторить',
    openLedgerApp: 'Открыть приложение для {{appName}}',
    openLedgerAppDes:
      'Выберите и откройте приложение для {{appName}} в вашем устройстве Ledger.',
    chooseAddress: 'Выберите адрес',
    hdPath: 'Путь HD',
    chooseHwAddress: 'Выберите адрес, который вы хотите импортировать:',
    capNext: 'Далее',
    capPrev: 'Назад',
    adding: 'Добавление',
    keepHwConnected: 'Пожалуйста, поддерживайте соединение с Ledger.',
    accountAdded: 'Учетная запись добавлена',
    importedHwAccount:
      'Теперь вы можете получить доступ к своему кошельку Ledger из Fluent Wallet. Пожалуйста, вернитесь к расширению.',
    done: 'Выполнено',
    refreshLater: 'Пожалуйста, повторите попытку позже',
    hardwareWallet: 'Аппаратный кошелек',
    pKeyGroupName: 'Имя учетной записи',

    // confirm hw Modal
    waitingForSign: 'Ожидание входа',
    rejected: 'Отклонено',
    waitingContent: 'Пожалуйста, подтвердите эту операцию в вашем Ledger',
    rejectedContent: 'Транзакция была отклонена.',
    copyError: 'Копировать код ошибки',

    // conflux confirm tx error
    txPoolFull: 'Пул транзакций заполнен',
    nodeInCatchUpMode: 'Узел в режиме сихронизации',
    canNotRecoverPubKey: 'Невозможно восстановить открытый ключ',
    rlpIncorrectListLen: 'Неправильная информация о размере списка RLP',
    chainIdMismatch: 'Chain ID  не совпадает',
    zeroGasPrice: 'Цена на газ не может быть равна 0',
    tooDistantFuture: 'Номер (Nonce) слишком большой',
    duplicateTx: 'Повторная транзакция',
    epochHeightOutOfBound: 'Высота эпохи за пределами границ',
    gasExceedsLimit: 'Газ превышает допустимый предел',
    tooStaleNonce: 'Слишком устаревший номер (Nonce)',
    replacedWithHigherGasPriceTx: 'Повторная транзакция',
    gasPriceTooLow: 'Gas price too low',
    wrongAddressType: 'Wrong address type',
    notEnoughBaseGas: 'Not enough base gas',
    unknownError: 'Неизвестная ошибка',

    // ethereum confirm tx error
    replaceUnderpriced: 'Слишком низкая цена на газ',
    gasTooLow: 'Слишком низкая цена на газ',
    gasLimitReached: 'Достигнут предел газа',
    oversizedData: 'Данные слишком большие',
    nonceTooHigh: 'Номер (Nonce) слишком большой',
    nonceMax: 'Номер (Nonce)слишком большой',
    insufficientFunds: 'Недостаточно средств',
    intrinsicGas: 'Внутренний газ слишком низкий',
    txTypeNotSupported: 'Неподдерживаемый тип транзакции',
    feeCapVeryHigh: 'Слишком высокая цена газа',
    feeCapTooLow: 'Слишком низкая цена газа',
    tipAboveFeeCap: 'Ошибка приоритетной платы',
    tipVeryHigh: 'Ошибка приоритетной платы',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger не подключен',
    openExpandView: 'Откройте расширение Fluent Wallet для подключения',
    hwOpenApp:
      'Прежде чем продолжить, убедитесь, что приложение для {{appName}} открыто.',

    // error page
    errorTile: 'Ошибка',
    errorDes: 'Упс! Что-то пошло не так',
    routeError: 'Извините! Страница, которую вы ищете, не существует.',
    errorCode: 'Код ошибки',
    feedBackCode: 'Скопировать код и предоставить обратную связь',
    fullNodeError: 'Невозможно подключиться к узлу RPC.',
    close: 'Закрыть',
    reload: 'Перезагрузка',

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

export default ru
