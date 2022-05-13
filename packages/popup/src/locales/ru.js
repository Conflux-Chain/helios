const ru = {
  translation: {
    // - common
    cancel: 'Отменить',
    create: 'Создать',
    next: 'Далее',
    import: 'Импортировать',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    ok: 'Ок',
    sign: 'Подписать',
    switch: 'Переключить',
    no: 'Нет',
    yes: 'Да',
    copiedSuccess: 'Копирование успешно завершено',
    invalidAddress: 'Пожалуйста, введите корректный адрес cfx',
    invalidHexAddress: 'Пожалуйста, введите корректный адрес hex',
    unChecksumAddress: 'Invalid address, make sure the letter case is correct',
    protocol: 'Протокол',
    viewData: 'Просмотреть данные',
    learnMore: 'Узнать больше',
    optional: 'необязательно',
    back: 'Назад',
    transactionDetails: 'Детали транзакции',
    functionName: 'Функция',
    hexData: 'Hex данные',
    add: 'Добавить',
    notFilled: 'Не заполнено',
    unCaughtErrMsg: 'что-то пошло не так',

    // - home page
    send: 'Отправить',
    history: 'История',
    assets: 'Активы',
    crossSpace: 'Кросс Среда',

    // - homepage / 连接网站状态模块和切换连接弹窗模块
    noConnectedDapp: 'Нет соединения с указанным ресурсом',
    connected: 'Подключено',
    disconnect: 'Отключено',
    disconnectTitle: 'Отключиться',
    disconnectContent: 'Отключиться от данного ресурса?',

    // - homepage / dapp connect site 弹窗
    connectSite: 'Подключиться к данному ресурсу?',
    selectNetwork: 'Выберите сеть',
    selectAuthorizedAccounts: 'Авторизовать аккаунт',
    selectAll: 'Выбрать всё',
    connect: 'Подключить',
    chooseNetwork: 'Выбрать сеть',

    // - homepage / 授权单个账号
    authorizeCurrentAccount: 'Авторизовать {{currentAccount}}',
    needAuthTitle: 'Необходимо авторизоваться',
    needAuthContent:
      'Данный аккаунт не авторизован на данном ресурсе.<br/>Для пользования ресурсом авторизуйте аккаунт {{accountName}} ？',

    // - homepage / 账户管理 / 账户列表
    myAccounts: 'Мои аккаунты',
    addAccount: 'Добавить аккаунты',
    search: 'Поиск',

    // homepage / 账户管理 / 创建账户
    manyAccounts: '{{accountNum}} аккаунта',
    oneAccount: 'один аккаунт',

    newAccount: 'Добавить аккаунт',
    createAccount: 'Создать новый аккаунт',
    useExistingSeed: 'Использовать существующую seed фразу',
    faster: 'Быстрее',
    useExistingSeedDes:
      'Использовать HD кошелек, не создавать резервную копию повторно.',
    newSeedPhrase: 'Новая seed фраза',
    newSeedPhraseDes: 'Создать новую seed фразу и резервную копию.',
    importExistingAccount: 'Импортировать аккаунт',
    seedPhrase: 'Seed фраза восстановления',
    seedPhraseDes: 'Seed фраза состоит из слов, разделенных пробелами.',
    pKey: 'Секретный ключ',
    pKeysDes: 'Добавьте секретный ключ.',
    ledgerDes: 'Используйте ваш Ledger кошелек.',

    // homepage / 账户管理 / 创建账户 / 1. использовать существующую seed фразу
    accountName: 'Имя аккаунта',
    selectSeedPhrase: 'Выберите групповую seed фразу',

    // homepage / 账户管理 / 创建账户 / 2. новая seed фраза
    seedGroupName: 'Имя групповой seed фразы',
    invalidWord: 'Неверное слово',
    seedCreateTitle: 'Далее, отобразиться seed фраза',
    seedCreateContent:
      'Владение seed фразой, равно праву владению активами на балансе Вашего кошелька<br/>Пожалуйста, храните seed фразу должным образом, так как, в случае утраты, она не подлежит восстановлению',

    // homepage / 账户管理 / 创建账户 / 2. новая seed фраза / резервная копия seed фразы
    backupSeedTitle: 'Резервная копия seed фразы',
    backupSeedContent:
      'Пожалуйста, скопируйте seed фразу.<br/>Пожалуйста, не храните и не пересылайте вашу seed фразу онлайн.',
    confirmSeedTitle: 'Проверить seed фразу',
    confirmSeedContent:
      'Пожалуйста, перепроверьте корректность параметров созранения seed фразы.',
    confirmSeedError: 'Ошибки в seed фразе.',

    // homepage / 账户管理 / 创建账户 / 3. импорт существующего аккаунта
    seedImport: 'Импорт seed фразы',
    seedImportPlaceholder:
      'Seed фраза cостоит из слов, разделенных между собой пробелом. Пробелом разделены все слова seed фразы.',
    duplicateSeedError: 'Данная seed фраза уже в Вашем кошельке.',
    invalidSeed:
      'Неверная seed фраза, перепроверьте корректность ввода данных.',

    // homepage / 账户管理 / 创建账户 / 4. импорт аккаунта с помощью  секретного ключа
    pKeyImport: 'Импортировать секретный ключ',
    pKeyImportPlaceholder: 'Введите Ваш секретный ключ здесь.',
    duplicatePkError: 'Данный секретный ключ уже в Вашем кошельке.',
    invalidPrivateKey: 'Неверный секретный ключ, попробуйте снова.',

    // - Сеть
    network: 'Сеть',
    mainnet: 'Основная сеть',
    testnet: 'Тестовая сеть',
    custom: 'Пользовательская сеть',

    // - добавление токена
    addToken: 'Добавить токен',
    searchToken: 'Поиск по названию или адресу',
    searchResults: 'Искать',
    noResult: 'Совпадений не найдено',
    willSupport1559: 'EIP-1559 support coming soon.',
    remove: 'Remove',

    // Начальная страница
    welcomeToConflux: 'Добро пожаловать в Conflux Network',

    // - Страница авторизации
    welcomeBack: 'Добро пожаловать',
    welcome: 'Войдите в мир Web3',
    password: 'Введите пароль',
    unlock: 'Разблокировать',
    passwordRulesWarning:
      'Пароль должен содержать от  8 до 128 символов, как буквенных так и численных.',
    en: 'English',
    zh: '简体中文',
    fr: 'Français (Communauté)',
    ru: 'Pусский (Сообщество)',

    // - Отправить транзацию
    // -Отправить транзакцию/отправить транзакцию
    sendTransaction: 'Отправить транзакцию',
    toAddressLabel: 'Отправить на',
    toAddressPlaceholder: 'пожалуйста введите адрес получателя',
    tokenAndAmount: 'Название токена и количество',
    available: 'доступно: ',
    max: 'ВСЕ',

    // - Send Transaction / choose token
    chooseToken: 'Выберите токен',
    tokenList: 'Список токенов',
    noTxnWarning:
      'Данный адрес используется впервые, пожалуйста перепроверьте все данные',

    // - Send Transaction / Sign Transaction
    signTransaction: 'Подписать транзакцию',
    sendToken: 'Отправить токен',
    toAddress: 'На адрес',
    gasFee: 'Gas комиссионные',
    edit: 'Изменить',
    sponsored: 'Спонсировано',
    partSponsored: 'Partially Sponsored',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFeeControl: 'Gas контроллер',
    gasPrice: 'Gas Цена',
    gasLimit: 'Gas Лимит',
    storageFee: 'Комиссия за хранилище',
    storageCollateralized: 'Лимит хранилища',
    totalFee: 'Итоговая комиссия',
    customNonce: 'Пользовательское Nonce',
    gasPriceErrMSg: 'Минимальная. цена на Gas за 1 {{unit}}',
    gasLimitMinErr: 'Gas Лимит должен быть не менее {{gasUsed}}',
    gasLimitMaxErr: 'Gas Лимит должен быть не более {{gasMax}}',
    nonceErr: 'Nonce не может равняться нулю',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: 'Транзакция отправлена',
    viewOnScan: 'Просмотреть в ConfluxScan',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: 'Подтверждение токена',
    approveTo: 'Подтвердить',
    contract: 'Контракт',
    allowLimit: 'Подтвердить лимит',
    action: 'Действие',
    balance: 'Баланс',
    createContract: 'Развернуть контракт',

    // - Send Transaction / Sign Transaction / 3. token approve - view data
    // 此处展示内容为交易详情，在多种情况是相同的，不止是 token approve 这个场景，详见 common

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Изменить разрешения',
    spendLimitPermission: 'Разрешение на лимит расходования',

    // 允许操作的限额权限描述
    allowSpendDes: 'Разрешить {{dapp}} вывод и расходование суммы',
    proposedApprovalLimit: 'Установить лимиты подтверждения',
    proposedApprovalLimitDes: 'Запрос лимита расходов для {{dapp}}',
    customSpendLimit: 'Пользовательский лимит расходов ',
    customSpendLimitDes: 'Установите максимальный лимит расходов',
    customLimitErr: 'Лимит должен быть больше 0 {{unit}}',

    // - Send Transaction / - история
    activity: 'Активность',
    failed: 'Не выполнено',
    executed: 'Выполнено',
    pending: 'В очереди',
    sending: 'Выполняется',
    contractCreation: 'Создание контракта',
    contractInteraction: 'Взаимодействие с контрактом',
    unknown: 'Неизвестно',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: 'Cancel Transaction',
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

    // - request signature - 1. Sign Text
    signText: 'Подписать текст',
    signThisText: 'Подписать данный текст?',

    // - request signature - 2. Подписать сообщение
    signThisMessage: 'Подписать данное сообщение?',
    signTypeMessage: 'Подписать набранное сообщение',
    message: 'Сообщение',

    // - добавить сеть
    addNetwork: 'Добавить сеть',
    allowAddNetwork: 'Разрешить данному ресурсу подключение к данной сети?',
    warningAddNetwork:
      'Вы подтверждаете, что доверяете данному ресурсу? Кошелек Fluent не верифицирует пользовательские сети.',
    networkName: 'Имя сети',
    networkUrl: 'URL сети',
    chainId: 'Chain ID',
    currencySymbol: 'Тикер токена (Необязательно)',
    blockExplorerUrl: 'URL блок провайдера (Необязательно)',

    // - добавить токен
    addSuggestedToken: 'Добавить токен',
    confirmAddSuggestedToken: 'Вы подтверждаете добавление данного токена?',

    // - Переключение Сети
    switchNetwork: 'Сменить сеть',
    allowSwitchNetwork: 'Разрешить данному ресурсу смену сети?',
    warningSwitchNetwork:
      'Данная операция сменит сеть, в кошельке Fluent, на выбранную ранее',

    // - страница установки пароля
    setPWD: 'Установить пароль',
    enterPWD: 'Введите пароль ',
    enterPWDAgain: 'Введите пароль еше раз',
    rememberPWD:
      'Данный пароль не может быть извлечен, пожалуйста запомните и надежно сохраните его.',
    invalidPassword: 'Неверный пароль.',
    invalidConfirmPassword: 'Введенные Вами пароли не совпадают.',
    // - страница входа
    hello: 'Добро пожаловать',

    // - миграция
    migration: 'Миграция в один клик',

    // управление аккаунтом
    accountManagement: 'Управление аккаунтом',
    lock: 'Заблокировано',
    enterPassword: 'Для продолжения введите пароль',
    viewSeed: 'Показать секретную seed фразу',
    hide: 'Скрыть',
    delete: 'Удалить',
    groupDeleteWarning: 'Нельзя удалить данную группу аккаунтов.',
    accountDeleteWarning: 'Can not delete current account.',
    accountHideWarning: 'Нельзя скрыть данный аккаунт.',
    ledgerTips: 'This account(s) can only be used on {{network}}.',

    // Управление сетями
    networkManagement: 'Управление сетями',
    newRpcUrl: 'RPC URL',
    networkType: 'Тип сети',
    wrongRpcUrl:
      'Не удалось получить chain ID. Проверьте верность ввода RPC URL',
    networkDeleteWarning: 'Невозможно удалить данную сеть.',
    duplicateNetworkEndpoint: 'Задвоение конечных точек сети.',
    urlWarning: 'URL требуют ввода соотвествующего префикса HTTP/HTTPS.',
    invalidRpcUrl: 'Ошибка ввода RPC URL',

    // Advanced Settings
    AdvancedSettings: 'Advanced Settings',
    priorityConnection: 'Priority Connection',
    priorityConnectionDes:
      'Fluent will be the first option when connecting to any dApp on EVM networks.',
    showTestnet: 'Show Testnet',
    showTestnetDes: 'Select this to show test networks in network list.',

    // О нас
    about: 'О нас',
    website: 'Официальный сайт',
    feedback: 'Обратная связь',
    docs: 'Документация',
    version: 'Версия',

    // Авторизация сайта
    authorizedWebsite: 'Авторизованный сайт',
    noAuthorizedWebsite: 'Сайт не авторизоаан',

    // Режим разработчика
    developerMode: 'Режим разработчика',
    compatibilityMode: 'Режим совместимости',
    compatibilityDes:
      'Fluent со временем перестанет поддерживать API ConfluxPortal. Отключите режим совместимости, чтобы сделать Fluent несовместимым с API ConfluxPortal.  Только для тестирования в режиме разработчиков .',

    // резервная
    backupIdentity: 'Резервная копия seed фразы',
    backupSeedDes:
      'Пожалуйста, сохраните резервную копию и храните ее должным образом, в оффлайн режиме и без допуска третьих лиц',
    backupPk: 'Резервная копия аккаунта',
    backupPkDes:
      'Это Ваш секретный ключ. Владение секретными ключами является единственным подтверждением права владения аккаунтами и средствами на них. Пожалуйста, храните их должным образом, в оффлайн режиме и без допуска третьих лиц. Потерянные ключи не могут быть восстановлены.',
    confluxPathStandard: 'Conflux Path Standard',
    confluxPathStandardDes: "Generated by Conflux path standard 'm/503'",
    ethereumPathStandard: 'Ethereum Path Standard',
    ethereumPathStandardDes: "Generated by Conflux path standard 'm/60'",

    transferAmountExceedsAllowance:
      'Сумма перевода превышает установленный лимит',
    balanceIsNotEnough: 'Недостаточный баланс',
    gasFeeIsNotEnough: 'Недостаточный лимит gas',
    contractError: 'Ошибка контракта ',
    invalidPasswordFromRpc: 'Неверный пароль',
    required: 'Пожалуйста, введите вашу seed фразу.',
    changeNetworkError: 'Ошибка смены сети',

    // аппаратный кошелек
    connectHardwareWallet: 'Подключить аппаратный кошелек',
    supportLedger: 'Добавлена поддержка Ledger .',
    ledgerGuardDes: 'How to create a Conflux Core Wallet in Ledger?',
    followConnectLedgerSteps:
      'Пожалуйста, следуйте данной пошаговой инструкции для подключения Ledger.',
    steps: 'Шаг {{number}}',
    pluginHardwareWallet: 'Вставьте Ваш аппаратный кошелек в USB порт.',
    enterPinCode: 'Введите PIN код.',
    selectConfluxApp: 'Select and open the App for {{chainName}} in Ledger',
    ready: 'Готово',
    specifiedConnectedChain:
      '<Container><Content>Connect Ledger on</Content><CurrentNetworkDisplay/></Container>',

    // подключение аппаратного кошелька
    searchHwWallet: 'Поиск кошелька',
    connectLedgerTips:
      'Подключите Ваш Ledger, разблокируйте его, и добавьте необходимые разрешения в Ваш браузер.',
    connectLedger: 'Подключить Ваш Ledger',
    connectLedgerDes: 'Нажмите на кнопку ниже, чтобы подтвердить соединение.',
    waitForPermission: 'Дождитесь разрешения',
    connectFailed: 'Ошибка соединения',
    retry: 'Повторить',
    openConfluxApp: 'Open the App for {{chainName}}',
    openConfluxAppDes:
      'Select and open the App for {{chainName}} in your Ledger device.',
    chooseAddress: 'Выбрать адрес',
    hdPath: 'HD Путь',
    chooseHwAddress: 'Выберите адрес, который необходимо импортировать:',
    capNext: 'Следующее',
    capPrev: 'Предыдушее',
    adding: 'Добавление',
    keepHwConnected: 'Пожалуйста, не прерывайте соединение.',
    accountAdded: 'Аккаунт добавлен',
    importedHwAccount:
      'Теперь вы можете осуществлять доступ к Вашему кошельку Ledger непосредственно через Fluent. Пожалуйста, вернитесь к расширению.',
    done: 'Выполнено',
    refreshLater: 'Пожалуйста, попробуйте позднее',
    hardwareWallet: 'Аппаратный кошелек',
    pKeyGroupName: 'Имя аккаунта',

    // confirm hw Modal
    waitingForSign: 'Ожидание подписи',
    rejected: 'Ошибка',
    waitingContent:
      'Пожалуйста, подтвердите выполнение транзакции в вашем Ledger.',
    rejectedContent: 'Ошибка транзакции.',
    copyError: 'Copy error code',

    // conflux confirm tx error
    txPoolFull: 'Пул транзакций переполнен',
    nodeInCatchUpMode: 'Нода в режиме сихронизации',
    canNotRecoverPubKey: 'Невозможно восстановить секретный ключ',
    rlpIncorrectListLen: 'Неверная длина списка RLP',
    chainIdMismatch: 'Неверное значение Chain ID ',
    zeroGasPrice: 'Стоимость gas не может равняться 0',
    tooDistantFuture: 'Слишком большое значение Nonce ',
    duplicateTx: 'Задвоение транзакции',
    epochHeightOutOfBound: 'Некоректное значение номера эпохи',
    gasExceedsLimit: 'Gas превышает лимит',
    tooStaleNonce: 'Устаревшее значение Nonce',
    replacedWithHigherGasPriceTx: 'Задвоение транзакции',
    unknownError: 'Неизвестная ошибка',

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
    ledgerIsNotConnected: 'Ledger не подсоединен',
    openExpandView: 'Откройте Fluent и проверьте подключение',
    hwOpenApp:
      'Before clicking confirm, make sure the App for {{chainName}} is open.',

    // error page
    errorTile: 'Ошибка',
    errorDes: 'Уупппсссс что-то пошло не так...',
    routeError: 'Извините! запрошенная вами страница не найдена',
    errorCode: 'Ошибка кода',
    feedBackCode: 'Скопируйте код и ваше обращение',
    fullNodeError: 'Невозможно подключиться к ноде RPC.',
    close: 'Закрыть',
    reload: 'Перезапустить',
  },
}

export default ru
