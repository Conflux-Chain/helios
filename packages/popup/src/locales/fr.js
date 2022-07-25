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
    unChecksumAddress:
      'Adresse invalide, assurez-vous que la casse des lettres est correcte',
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

    // - homepage
    send: 'Envoyer',
    history: 'Historique',
    assets: 'Actifs',
    crossSpace: 'Cross Space',

    // - homepage /  dapp footer
    noConnectedDapp: 'Non connecté au site internet actuel',
    connected: 'Connecté',
    disconnect: 'Déconnecté',
    disconnectTitle: 'Déconnexion',
    disconnectContent: 'Déconnecter ce site internet ?',

    // - homepage / dapp connect site popup
    connectSite: 'Se connecter à ce site internet ?',
    permissionRequest: 'Demande d’autorisation',
    allowPermission: 'Autoriser ces permissions pour ce site ?',
    selectNetwork: 'Quel réseau souhaitez-vous utiliser ?',
    selectAuthorizedAccounts: 'Comptes autorisés',
    selectAll: 'Tout',
    connect: 'Connecter',
    chooseNetwork: 'Choisir un réseau',
    viewSelectedAddress: 'Voir l’adresse publique du compte sélectionné',
    viewMultiAddress: 'Voir l’adresse multi-chaîne du compte sélectionné',

    // - homepage / authorize single account
    authorizeCurrentAccount: 'Autoriser {{currentAccount}}',
    needAuthTitle: 'Autorisation nécessaire',
    needAuthContent:
      'Le compte n’est pas autorisé sur ce site internet.<br/>Autoriser ce site internet à utiliser {{accountName}} ？',

    // - homepage / account management / account list
    myAccounts: 'Mes Comptes',
    addAccount: 'Ajouter un compte',
    search: 'Rechercher',

    // homepage / account management / create account
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

    // homepage / account management / create account / 1. use existing seed phrase
    accountName: 'Nom du Compte',
    selectSeedPhrase: 'Sélectionner un groupe de phrases de récupération',

    // homepage / account management / create account / 2. new seed phrase
    seedGroupName: 'Nom du Groupe de phrases de récupération',
    invalidWord: 'Mot invalide',
    seedCreateTitle: 'La phrase de récupération sera affichée par la suite',
    seedCreateContent:
      'L’obtention de la phrase de récupération permet de récupérer tous les actifs du portefeuille.<br/>Si cette phrase est perdue, elle ne peut pas être récupérée, veuillez la conserver précieusement',

    // homepage / account management / create account / 2. new seed phrase / backup seed phrase
    backupSeedTitle: 'Sauvegarder la Phrase de récupération',
    backupSeedContent:
      'Merci de copier la phrase de récupération dans l’ordre.<br/>Ne partagez pas et ne conservez pas cette phrase dans un environnement en réseau.',
    confirmSeedTitle: 'Vérifier la phrase de récupération',
    confirmSeedContent:
      'Merci de cliquer sur les mots de la phrase de récupération dans l’ordre pour s’assurer qu’elle soit correctement sauvegardée.',
    confirmSeedError: 'Phrase de récupération invalide.',

    // homepage / account management / create account / 3. Import existing account
    seedImport: 'Importer la Phrase de récupération',
    seedImportPlaceholder:
      'La phrase de récupération est composée de mots séparés par des espaces. Séparez chaque mot par un espace.',
    duplicateSeedError:
      'Cette phrase de récupération est déjà présente dans votre portefeuille.',
    invalidSeed: 'Phrase de récupération invalide, vérifiez à nouveau.',

    // homepage / account management / create account / 4. Import account with private key
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
    remove: 'Supprimer',

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
    uk: 'Українська (Cпільнота)',

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
    partSponsored: 'Partiellement sponsorisé',

    // - Send Transaction / Error or Warning
    error: 'Erreur',
    warning: 'Avertissement',

    // - Send Transaction / Sign Transaction / 1. Edit gas fee
    editGasFee: 'Éditer Frais de Gas',
    low: 'Faible',
    medium: 'Marché',
    high: 'Aggressif',
    suggested: 'Suggéré',
    advanced: 'Avancé',
    gasCost: 'Est. Coût Gas',
    gasOption: 'Option Gas',
    gasFeeDetail: 'Détail Frais Gas',
    maxFeePerGas: 'Frais Max Par Gas',
    maxPriorityFeePerGas: 'Frais Priorité Max Par Gas',
    maxFee: 'Frais Max',
    baseFee: 'Frais de Base',
    priorityFee: 'Frais Prioritaires',
    current: 'Actuel: ',
    twelveHour: '12h: ',
    gasPrice: 'Prix du Gas',
    gasLimit: 'Limite de Gas',
    storageFee: 'Frais du stockage',
    storageLimit: 'Limite de stockage',
    totalFee: 'Frais Totaux',
    customNonce: 'Nonce personalisé',
    gasPriceErr: 'Le prix minimum du Gas est de {{amount}} {{unit}}',
    maxPriorityFeePerGasLowErr:
      'Le minimum de la valeur tapée est {{amount}} {{unit}}',
    maxPriorityFeePerGasHighErr: 'Valeur tapée <= "Frais Max Par Gas" est requise',
    gasLimitMinErr: 'La limite de Gas doit être d’au moins {{gasUsed}}',
    gasLimitMaxErr: 'La limite de Gas doit être au maximum de {{gasMax}}',
    nonceErr: 'Nonce >= 0 est requis',

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

    // - Send Transaction / Sign Transaction / 3. token approve -  edit approve limit permissions
    editPermission: 'Éditer la restriction',
    spendLimitPermission: 'Restriction de limite de dépense',

    // approve allowance
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
    receive: 'Reçue',

    // - Send Transaction / - speedup and cancel tx
    cancelTransaction: 'Annuler la transaction',
    speedUp: 'Accélérer',
    suggestedGasPrice: 'Prix de Gas suggéré',
    inputGasPrice: 'Prix de Gas d’entrée',
    spend: 'Dépenser',
    cancelTxDes:
      'L’envoi de cette modification ne garantit pas que votre transaction originale sera annulée. Si la tentative d’annulation réussit, les frais de Gas de la transaction ci-dessus vous seront facturés',
    speedupTxDes:
      'L’envoi de cette modification ne garantit pas que votre transaction d’origine sera accélérée. Si la tentative d’accélération réussit, les frais de Gas de la transaction ci-dessus vous seront facturés.',
    speedupTransaction: 'Accélérer la Transaction',
    submit: 'Soumettre',
    customGasPrice: 'Prix de Gas personalisé',
    executedTx:
      'La transaction a été exécutée ou terminée. Aucune action n’est requise.',
    amount: 'Montant',
    hash: 'Hash',
    nonce: 'Nonce',
    fromAddress: 'Depuis l’adresse',

    // - request signature - 1. Sign Text
    signText: 'Signer le Texte',
    signThisText: 'Signer ce Texte ?',
    disablePersonSign:
      'Le portefeuille matériel ne supporte pas encore de signe personel.',
    disableTypeSign: 'Le portefeuille matériel ne supporte pas encore de signe tapé.',

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
    viewSeed: 'Afficher la phrase secrète de récupération',
    hide: 'Cacher',
    delete: 'Supprimer',
    groupDeleteWarning: 'Impossible de supprimer le groupe de compte actuel.',
    accountDeleteWarning: 'Impossible de supprimer le compte actuel.',
    accountHideWarning: 'Impossible de cacher le compte actuel.',
    lastAccountHideWarning: 'Garder un compte minimum dans ce groupe.',
    ledgerTips: 'Ce(s) compte(s) ne peut être utilisé que sur {{network}}.',

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
    AdvancedSettings: 'Paramêtres avancés',
    priorityConnection: 'Connexion Prioritaire',
    priorityConnectionDes:
      'Fluent sera la première option lors de la connexion à une dApp sur les réseaux EVM.',
    showTestnet: 'Afficher la Testnet',
    showTestnetDes:
      'Selectionner cela pour afficher les testnets dans la liste de réseaux disponibles.',

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

    // backup
    backupIdentity: 'Sauvegarder la Phrase de récupération',
    backupSeedDes:
      'Veuillez sauvegarder la phrase de récupération dans le bon ordre. Ne la partagez pas et ne la stockez pas dans un environnement en réseau.',
    backupPk: 'Sauvegarde du Compte',
    backupPkDes:
      'Ceci est votre clé privée. L’obtenir signifie posséder tous les actifs. Veuillez la garder en lieu sûr car une fois perdue, elle ne pourra pas être récupérée.',
    confluxPathStandard: 'Conflux Core Wallet',
    confluxPathStandardDes: "Généré par le chemin Conflux standard 'm/503'",
    ethereumPathStandard: 'Ethereum Wallet',
    ethereumPathStandardDes: "Généré par le chemin Ethereum standard 'm/60'",

    transferAmountExceedsAllowance:
      'Le montant du transfert dépasse l’allocation',
    balanceIsNotEnough: 'Balance insuffisante',
    gasFeeIsNotEnough: 'Frais de gas insuffisant',
    contractError: 'Erreur Contrat : ',
    invalidPasswordFromRpc: 'Mot de passe incorrect',
    required: 'Merci de saisir votre phrase seed.',
    changeNetworkError: 'Erreur de changement réseau',

    // hardware guard
    connectHardwareWallet: 'Connecter le Hardware Wallet',
    supportLedger: 'Ledger est supporté maintenant.',
    ledgerGuardDes: 'Comment créer un Core Wallet Conflux dans Ledger?',
    followConnectLedgerSteps:
      'Merci de suivre les étapes ci-dessous pour connecter votre Ledger.',
    steps: 'Étapes {{number}}',
    pluginHardwareWallet:
      'Branchez votre hardware wallet sur votre ordinateur en utilisant un port USB.',
    selectLedgerApp: 'Sélectionner et ouvrir l’App {{appName}}.',
    hardwareAccountTips: 'Le(s) compte(s) ajouté(s) est disponible sur {{chain}}',
    ready: 'Prêt',
    specifiedConnectedChain:
      '<Container><Content>Connecter Ledger sur</Content><CurrentNetworkDisplay/></Container>',

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
    openLedgerApp: 'Ouvrir l’App {{appName}}',
    openLedgerAppDes: 'Sélectionner et ouvrir l’App {{appName}} sur votre dispositif Ledger.',
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
    rejected: 'Rejetée',
    waitingContent: 'Merci de confirmer cette transaction sur votre Ledger.',
    rejectedContent: 'La transaction a été rejetée.',
    copyError: 'Copier le code erreur',

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
    gasPriceTooLow: 'Le prix du Gas est trop bas',
    wrongAddressType: 'Type d’adresse incorrect',
    notEnoughBaseGas: 'Gas de base insuffisant',
    unknownError: 'Erreur inconnue',

    // ethereum confirm tx error
    replaceUnderpriced: 'Gas insuffisant',
    gasTooLow: 'Gas insuffisant',
    gasLimitReached: 'Limite de Gas atteinte',
    oversizedData: 'Les datas sont surdimensionnées',
    nonceTooHigh: 'Le Nonce est trop grand',
    nonceMax: 'Le Nonce est trop grand',
    insufficientFunds: 'Fonds insuffisants',
    intrinsicGas: 'Gas intrasèque insuffisant',
    txTypeNotSupported: 'Type de transaction non supporté',
    feeCapVeryHigh: 'Le prix du Gas est trop élevé',
    feeCapTooLow: 'Le prix du Gas est trop bas',
    tipAboveFeeCap: 'Erreur de frais de priorité',
    tipVeryHigh: 'Erreur de frais de priorité',

    // confirm hw alert
    ledgerIsNotConnected: 'Ledger n’est pas connecté',
    openExpandView: 'Ouvrir la vue étendue de Fluent pour vous connecter',
    hwOpenApp:
      'Assurez-vous que l’App {{appName}} est ouverte avant de cliquer sur Confirmer.',

    // error page
    errorTile: 'Erreur',
    errorDes: 'oups, quelque chose ne va pas...',
    routeError: 'Désolé ! La page recherchée n’existe pas.',
    errorCode: 'Code Erreur',
    feedBackCode: 'Copier le code et envoyer un feedback',
    fullNodeError: 'Impossible de se connecter au noeud RPC.',
    close: 'Fermer',
    reload: 'Rafraichir',

    // address book & contacts
    addressBook: 'Carnet d’adresses',
    contacts: 'Contacts',
    recent: 'Récent',
    account: 'Compte',
    searchAddressNickname: 'Rerchercher une adresse ou un pseudonyme',
    addedContactWarning: 'Cette adresse a déjà été ajoutée !',
    deleteContactTitle: 'Confirmer la suppression de ce contact',
    deleteContactContent: 'Souhaitez-vous supprimer ce contact ?',
    name: 'Nom',
    address: 'Adresse',
  },
}

export default fr
