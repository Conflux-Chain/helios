const fr = {
  translation: {
    // - common
    cancel: 'Annuler',
    create: 'Créer',
    next: 'Suivant',
    import: 'Importer',
    confirm: 'Confirmer',
    save: 'Sauvegarder',
    ok: 'OK',
    sign: 'Signer',
    switch: 'Changer',
    no: 'Non',
    yes: 'Oui',
    copiedSuccess: 'Copiée avec succès',
    invalidAddress: 'Merci d’indiquer une adresse cfx valide',
    invalidHexAddress: 'Merci d’indiquer une adresse hex valide',
    protocol: 'Protocole',
    viewData: 'Visualiser les données',
    learnMore: 'En savoir plus',
    optional: 'optionel',
    back: 'Précédent',
    transactionDetails: 'Détails de transaction',
    functionName: 'Fonction',
    hexData: 'Données Hex',
    add: 'Ajouter',
    notFilled: 'Non renseigné',
    unCaughtErrMsg: 'quelque chose ne va pas',

    // - home page
    send: 'Envoyer',
    history: 'Historique',
    assets: 'Actifs',
    crossSpace: 'Cross Space',

    // - homepage / 连接网站状态模块和切换连接弹窗模块
    noConnectedDapp: 'Non connecté au site internet actuel',
    connected: 'Connecté',
    disconnect: 'Déconnecté',
    disconnectTitle: 'Déconnexion',
    disconnectContent: 'Déconnecter ce site internet ?',

    // - homepage / dapp connect site 弹窗
    connectSite: 'Se connecter à ce site internet ?',
    selectNetwork: 'Quel réseau souhaitez-vous utiliser ?',
    selectAuthorizedAccounts: 'Comptes autorisés',
    selectAll: 'Tout',
    connect: 'Connecter',
    chooseNetwork: 'Choisir un réseau',

    // - homepage / 授权单个账号
    authorizeCurrentAccount: 'Autoriser {{currentAccount}}',
    needAuthTitle: 'Autorisation nécessaire',
    needAuthContent:
      'Le compte n’est pas autorisé sur ce site internet.<br/>Autoriser ce site internet à utiliser {{accountName}} ？',

    // - homepage / 账户管理 / 账户列表
    myAccounts: 'Mes Comptes',
    addAccount: 'Ajouter un compte',
    search: 'Rechercher',

    // homepage / 账户管理 / 创建账户
    manyAccounts: '{{accountNum}} Comptes',
    oneAccount: '1 Compte',

    newAccount: 'Créer un Compte',
    createAccount: 'Créer un nouveau compte',
    useExistingSeed: 'Utiliser une phrase de récupération existante',
    faster: 'Plus rapide',
    useExistingSeedDes:
      'Utiliser HD Wallet, inutile de le sauvegarder à nouveau.',
    newSeedPhrase: 'Nouvelle phrase de récupération',
    newSeedPhraseDes:
      'Créer une nouvelle phrase de récupération et la sauvegarder.',
    importExistingAccount: 'Importer un Compte',
    seedPhrase: 'Phrase de récupération',
    seedPhraseDes:
      'La phrase de récupération est composée de mots séparés par des espaces.',
    pKey: 'Clé Privée',
    pKeysDes: 'Saisir la clé privée en texte en clair.',
    ledgerDes: 'Utiliser votre portefeuille Ledger.',

    // homepage / 账户管理 / 创建账户 / 1. use existing seed phrase
    accountName: 'Nom du Compte',
    selectSeedPhrase: 'Sélectionner un groupe de phrases de récupération',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase
    seedGroupName: 'Nom du Groupe de phrases de récupération',
    invalidWord: 'Mot invalide',
    seedCreateTitle: 'La phrase de récupération sera affichée par la suite',
    seedCreateContent:
      'L’obtention de la phrase de récupération permet de récupérer tous les actifs du portefeuille.<br/>Si cette phrase est perdue, elle ne peut pas être récupérée, veuillez la conserver précieusement',

    // homepage / 账户管理 / 创建账户 / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Sauvegarder la Phrase de récupération',
    backupSeedContent:
      'Merci de copier la phrase de récupération dans l’ordre.<br/>Ne partagez pas et ne conservez pas cette phrase dans un environnement en réseau.',
    confirmSeedTitle: 'Vérifier la phrase de récupération',
    confirmSeedContent:
      'Merci de cliquer sur les mots de la phrase de récupération dans l’ordre pour s’assurer qu’elle soit correctement sauvegardée.',
    confirmSeedError: 'Phrase de récupération invalide.',

    // homepage / 账户管理 / 创建账户 / 3. Import existing account
    seedImport: 'Importer la Phrase de récupération',
    seedImportPlaceholder:
      'La phrase de récupération est composée de mots séparés par des espaces. Séparez chaque mot par un espace.',
    duplicateSeedError:
      'Cette phrase de récupération est déjà présente dans votre portefeuille.',
    invalidSeed: 'Phrase de récupération invalide, vérifiez à nouveau.',

    // homepage / 账户管理 / 创建账户 / 4. Import account with private key
    pKeyImport: 'Importer la Clé Privée',
    pKeyImportPlaceholder: 'Saisir votre Clé Privée ici.',
    duplicatePkError:
      'Cette Clé Privée est déjà présente dans votre portefeuille.',
    invalidPrivateKey: 'Clé invalide, vérifiez à nouveau.',

    // - Network
    network: 'Réseau',
    mainnet: 'Mainnet',
    testnet: 'Testnet',
    custom: 'Personalisé',

    // - add token
    addToken: 'Ajouter un jeton',
    searchToken: 'Rechercher par nom ou adresse',
    searchResults: 'Résultats de recherche',
    noResult: 'Pas de résultat',

    // welcome page
    welcomeToConflux: 'Bienvenue sur Conflux Network',

    // - login page
    welcomeBack: 'Content de te revoir',
    welcome: 'Entrer dans le monde Web3',
    password: 'Saisir votre mot de passe',
    unlock: 'Déverrouiller',
    passwordRulesWarning:
      'Utiliser 8 à 128 caractères en mixant des lettres et des chiffres.',
    en: 'English',
    zh: '简体中文',
    fr: 'Français (Communauté)',
    ru: 'Pусский (Сообщество)',

    // - Send Transaction
    // - Send Transaction / send transaction
    sendTransaction: 'Transaction d’envoi',
    toAddressLabel: 'Envoyer à',
    toAddressPlaceholder: 'Merci de saisir une adresse',
    tokenAndAmount: 'Jeton et Montant',
    available: 'Disponible : ',
    max: 'MAX',

    // - Send Transaction / choose token
    chooseToken: 'Choisir un Jeton',
    tokenList: 'Liste des Jetons',
    noTxnWarning:
      'Cette adresse NE DISPOSE PAS d’historique de transactions, veuillez revérifier',

    // - Send Transaction / Sign Transaction
    signTransaction: 'Signer la Transaction',
    sendToken: 'Envoyer le Jeton',
    toAddress: 'Vers l’Adresse',
    gasFee: 'Frais de Gas',
    edit: 'Éditer',
    sponsored: 'Sponsorisé',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFeeControl: 'Contrôleur du Gas',
    gasPrice: 'Prix du Gas',
    gasLimit: 'Limite de Gas',
    storageFee: 'Frais du stockage',
    storageCollateralized: 'Limite de stockage',
    totalFee: 'Frais Totaux',
    customNonce: 'Nonce personalisé',
    gasPriceErrMSg: 'Le prix minimum du Gas est de {{amount}} {{unit}}',
    gasLimitMinErr: 'La limite de Gas doit être d’au moins {{gasUsed}}',
    gasLimitMaxErr: 'La limite de Gas doit être au maximum de {{gasMax}}',
    nonceErr: 'Le Nonce ne peut pas être égal à 0',

    // - Send Transaction / Sign Transaction / 2. transaction result
    transactionSubmit: 'Transaction soumise',
    viewOnScan: 'Visualiser sur Scan',

    // - Send Transaction / Sign Transaction / 3. token approve - confirm transaction
    approveToken: 'Approbation du jeton',
    approveTo: 'Approuver à',
    contract: 'Contrat',
    allowLimit: 'Autoriser la limite',
    action: 'Action',
    balance: 'Balance',
    createContract: 'Déployer le Contrat',

    // - Send Transaction / Sign Transaction / 3. token approve - view data
    // 此处展示内容为交易详情，在多种情况是相同的，不止是 token approve 这个场景，详见 common

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Éditer la restriction',
    spendLimitPermission: 'Restriction de limite de dépense',

    // 允许操作的限额权限描述
    allowSpendDes:
      'Autoriser {{dapp}} à retirer et dépenser jusqu’au montant suivant:',
    proposedApprovalLimit: 'Limite d’approbation proposée',
    proposedApprovalLimitDes: 'Limite de dépense demandée par {{dapp}}',
    customSpendLimit: 'Personaliser la limite de dépense',
    customSpendLimitDes: 'Saisir une limite de dépense maximale',
    customLimitErr: 'La limite doit être supérieure à 0 {{unit}}',

    // - Send Transaction / - history
    activity: 'Activité',
    failed: 'Échouée',
    executed: 'Exécutée',
    pending: 'En attente',
    sending: 'Envoyée',
    contractCreation: 'Déploiement du Contrat',
    contractInteraction: 'Intéraction du Contrat',
    unknown: 'Inconnue',

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
    signText: 'Signer le Texte',
    signThisText: 'Signer ce Texte ?',

    // - request signature - 2. Sign Message
    signThisMessage: 'Signer ce Message ?',
    signTypeMessage: 'Signer le message saisi',
    message: 'Message',

    // - add network
    addNetwork: 'Ajouter un Réseau',
    allowAddNetwork: 'Autoriser ce site internet à ajouter un réseau?',
    warningAddNetwork:
      'Faites-vous confiance à ce site ? Fluent Wallet ne vérifie pas les réseaux personnalisés.',
    networkName: 'Nom du Réseau',
    networkUrl: 'URL du Réseau',
    chainId: 'ID de la chaîne',
    currencySymbol: 'Symbole de la monnaie (Optionel)',
    blockExplorerUrl: 'URL de l’explorateur de blocs (Optionelle)',

    // - add suggested token
    addSuggestedToken: 'Ajouter le jeton suggéré',
    confirmAddSuggestedToken: 'Souhaitez-vous ajouter ce jeton ?',

    // - Switch Network
    switchNetwork: 'Changer de Réseau',
    allowSwitchNetwork: 'Autoriser ce site à changer de réseau ?',
    warningSwitchNetwork:
      'Cela va basculer le réseau sélectionné avec Fluent vers le précédent réseau ajouté',

    // - set password page
    setPWD: 'Définir le mot de passe',
    enterPWD: 'Saisir le mot de passe',
    enterPWDAgain: 'Confirmer le mot de passe',
    rememberPWD: 'Ce mot de passe ne peut pas être récupéré, retenez-le.',
    invalidPassword: 'Mot de passe incorrect.',
    invalidConfirmPassword:
      'La confirmation du mot de passe ne correspond pas.',
    // - welcome page
    hello: 'Bonjour',

    // - migration
    migration: 'Migration en un clic',

    // account management
    accountManagement: 'Gestion du Compte',
    lock: 'Verrouiller',
    enterPassword: 'Saisir votre mot de passe pour continuer',
    viewSeed: 'Afficher la phrase Seed secrète',
    hide: 'Cacher',
    delete: 'Supprimer',
    groupDeleteWarning: 'Impossible de supprimer le groupe de compte actuel.',
    accountHideWarning: 'Impossible de cacher le compte actuel.',

    // Network Management
    networkManagement: 'Gestion du Réseau',
    newRpcUrl: 'URL du RPC',
    networkType: 'Type de Réseau',
    wrongRpcUrl:
      'Impossible de récupérer l’ID de la chaîne. Votre URL RPC est-elle correcte ?',
    networkDeleteWarning: 'Impossible de supprimer le réseau actuel.',
    duplicateNetworkEndpoint: 'Point de terminaison du réseau en doublon.',
    urlWarning: 'L’URL nécessite le préfixe HTTP/HTTPS approprié.',
    invalidRpcUrl: 'URL du RPC invalide',

    // Advanced Settings
    AdvancedSettings: 'Advanced Settings',
    priorityConnection: 'Priority Connection',
    priorityConnectionDes:
      'Fluent will be the first option when connecting to any dApp.',
    underCfxProvider: 'Enable on Conflux networks',
    underEtherProvider: 'Enable on Ethereum/EVM networks',
    showTestnet: 'Show Testnet',
    showTestnetDes: 'Select this to show test networks in network list.',

    // About
    about: 'À Propos',
    website: 'Site internet',
    feedback: 'Commentaires',
    docs: 'Docs',
    version: 'Version',

    // Authorized Website
    authorizedWebsite: 'Site internet autorisé',
    noAuthorizedWebsite: 'Site internet non autorisé',

    // Developer Mode
    developerMode: 'Mode Développeur',
    compatibilityMode: 'Mode Compatibilité',
    compatibilityDes:
      'L’API ConfluxPortal ne sera bientôt plus prise en charge par Fluent. Désactivez cette option pour rendre Fluent incompatible avec ConfluxPortal. Pour les tests des développeurs uniquement.',

    // backup seed
    backupIdentity: 'Sauvegarder la Phrase Seed',
    backupSeedDes:
      'Veuillez sauvegarder la phrase seed dans le bon ordre. Ne la partagez pas et ne la stockez pas dans un environnement en réseau.',
    backupPk: 'Sauvegarder du Compte',
    backupPkDes:
      'Ceci est votre clé privée. L’obtenir signifie posséder tous les actifs. Veuillez la garder en lieu sûr car une fois perdue, elle ne pourra pas être récupérée.',

    transferAmountExceedsAllowance:
      'Le montant du transfert dépasse l’allocation',
    balanceIsNotEnough: 'Balance insuffisante',
    gasFeeIsNotEnough: 'Frais de gas insuffisant',
    contractError: 'Erreur Contrat : ',
    addressHasBeenChanged: 'L’adresse a été changée',
    invalidPasswordFromRpc: 'Mot de passe incorrect',
    required: 'Merci de saisir votre phrase seed.',
    changeNetworkError: 'Erreur de changement réseau',

    // hardware guard
    connectHardwareWallet: 'Connecter le Hardware Wallet',
    supportLedger: 'Ledger est supporté maintenant.',
    ledgerGuardDes: 'Comment créer un portefeuille Conflux sur Ledger ?',
    followConnectLedgerSteps:
      'Merci de suivre les étapes ci-dessous pour connecter votre Ledger.',
    steps: 'Étapes {{number}}',
    pluginHardwareWallet:
      'Branchez votre hardware wallet sur votre ordinateur en utilisant un port USB.',
    enterPinCode: 'Entrer votre code PIN.',
    selectConfluxApp: 'Sélectionner et ouvrir Conflux App.',
    ready: 'Prêt',

    // connect hardware wallet
    searchHwWallet: 'Recherche du wallet en cours',
    connectLedgerTips:
      'Connecter votre Ledger, assurez-vous qu’il soit déverrouillé et que vous avez approuvé les autorisations sur votre navigateur.',
    connectLedger: 'Connecter votre Ledger',
    connectLedgerDes:
      'Cochez le bouton ci-dessous pour autoriser la connexion.',
    waitForPermission: 'En attente d’autorisation',
    connectFailed: 'Connexion Échouée',
    retry: 'Réessayer',
    openConfluxApp: 'Ouvrir Conflux App',
    openConfluxAppDes:
      'Selectionner and ouvrir Conflux App sur votre dispositif Ledger.',
    chooseAddress: 'Choisir une Adresse',
    hdPath: 'Chemin HD',
    chooseHwAddress: 'Choisir l’adresse que vous souhaitez importer :',
    capNext: 'SUIV',
    capPrev: 'PREC',
    adding: 'Ajouter',
    keepHwConnected: 'Merci de laisser votre Ledger connecté.',
    accountAdded: 'Compte ajouté',
    importedHwAccount:
      'Vous pouvez maintenant accéder à votre portefeuille Ledger depuis Fluent. Veuillez revenir à l’extension.',
    done: 'Fait',
    refreshLater: 'Merci de réessayer plus tard',
    hardwareWallet: 'Hardware Wallet',
    pKeyGroupName: 'Nom du Compte',

    // confirm hw Modal
    waitingForSign: 'En attente de signature',
    rejected: 'Rejettée',
    waitingContent: 'Merci de confirmer cette transaction sur votre Ledger.',
    rejectedContent: 'La transaction a été rejettée.',

    // conflux confirm tx error
    txPoolFull: 'La pool de transaction est pleine',
    nodeInCatchUpMode: 'Le noeud est en mode rattrapage',
    canNotRecoverPubKey: 'Récupération de la clé publique impossible',
    rlpIncorrectListLen: 'Longueur de liste RLP incorrecte',
    chainIdMismatch: 'L’ID de la chaîne ne correspond pas',
    zeroGasPrice: 'Le prix du Gas ne peut pas être de 0',
    tooDistantFuture: 'Le Nonce est trop grand',
    duplicateTx: 'Transaction en doublon',
    epochHeightOutOfBound: 'Hauteur d’époque hors limite',
    gasExceedsLimit: 'Le Gas dépasse la limite',
    tooStaleNonce: 'Le Nonce est périmé',
    replacedWithHigherGasPriceTx: 'Remplacer la Transaction',
    unknownError: 'Erreur inconnue',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger n’est pas connecté',
    openExpandView: 'Ouvrir la vue étendue de Fluent pour vous connecter',
    hwOpenApp:
      'Assurez-vous que Conflux App est ouverte avant de cliquer pour confirmer.',

    // error page
    errorTile: 'Erreur',
    errorDes: 'oups.quelque chose ne va pas...',
    routeError: 'Désolé ! La page recherchée n’existe pas.',
    errorCode: 'Code Erreur',
    feedBackCode: 'Copier le code et envoyer un feedback',
    fullNodeError: 'Impossible de se connecter au noeud RPC.',
    close: 'Fermer',
    reload: 'Rafraichir',
  },
}

export default fr
