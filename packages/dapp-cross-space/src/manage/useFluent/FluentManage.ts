import { observable, autorun, batch } from '@formily/reactive';
import { convertDrip2CFX, convertMappedAdress } from '../../utils';

export interface Status {
    isInstalled: boolean;
    isConnected?: boolean;
    account?: string;
    accounts?: string[];
    chainId?: ConfluxChainId;
    evmMappedAddress?: string;
}

const defaultFluentStatus: Omit<Status, 'isConnected' | 'account' | 'evmMappedAdress'> = {
    isInstalled: typeof window === 'undefined' ? false : window.conflux?.isFluent ?? false,
    accounts: undefined,
    chainId: undefined,
}

class FluentManage {
    status = observable.shallow(defaultFluentStatus);
    account = observable.computed(() => this.status.accounts?.[0]);
    isConnected = observable.computed(() => !!this.account.value);
    evmMappedAddress = observable.computed(() => this.account.value ? convertMappedAdress(this.account.value) : undefined); 

    trackBalanceCount = observable.ref(1);
    balance = observable.ref<string | undefined>(undefined);
    balanceTimer?: number = undefined;

    constructor() {
        if (!this.status.isInstalled || !window.conflux) return;
        window.conflux.on('accountsChanged', this.handleAccountsChanged);
        window.conflux.on('chainChanged', this.handleChainChanged);
        window.conflux.on('connect', this.handleConnect);
        window.conflux.on('disconnect', this.handleDisconnect);
        this.trackBalance();
    }

    getStatus = () => this.status;

    getAccounts = () => window.conflux!.request({ method: "cfx_requestAccounts" });

    getBalance = async () => {
        if (!this.account.value) return;
        try {
            const balance = await window.conflux!.request({ method: 'wallet_getBalance', params: [this.account.value] });
            this.balance.value = convertDrip2CFX(balance);
        } catch (err) {
            console.error('Get fluent balance error: ', err);
        }
    }

    handleConnect = ({ chainId }: { chainId: ConfluxChainId; }) => {
        if (!this.status.accounts?.[0]) return;
        this.status.chainId = String(parseInt(chainId)) as ConfluxChainId;
    };

    handleDisconnect = () => {
        Object.assign(this.status, defaultFluentStatus);
    }

    handleAccountsChanged = (accounts?: string[]) => {
        console.log('handleAccountsChanged: ', accounts);
        this.status.accounts = accounts;
    }

    handleChainChanged = async (newChainId: ConfluxChainId | '0xNaN') => {
        console.log('handleChainChanged: ', parseInt(newChainId));
        if (newChainId === '0xNaN') return;
        try {
            const newAccounts = await this.getAccounts();
            batch(() => {
                this.status.chainId = String(parseInt(newChainId)) as ConfluxChainId;
                this.handleAccountsChanged(newAccounts);
            });
        } catch {}
    }

    connect = () => {
        if (!this.status.isInstalled || !window.conflux) {
            throw new Error('not installed');
        }

        return window.conflux
            .request({ method: "cfx_requestAccounts" })
            .then(accounts => {
                this.handleAccountsChanged(accounts);
            })
    }

    trackBalance = () => {
        autorun(() => {
            clearInterval(this.balanceTimer);
            if (!this.account.value)
                this.balance.value = undefined;
            if (!this.account.value || !this.trackBalanceCount.value)
                return;
            this.getBalance();
            clearInterval(this.balanceTimer);
            this.balanceTimer = setInterval(this.getBalance, 1000) as unknown as number;
        });
    }

    startTrackBalance = () => this.trackBalanceCount.value += 1;

    stopTrackBalance = () => this.trackBalanceCount.value = Math.max(0, this.trackBalanceCount.value - 1);

    trackBalanceChangeOnce = (callback: Function) => {
        let dispose: (() => void) | undefined = undefined;
        dispose = autorun(() => {
            const watch = this.balance.value;
            if (!dispose) return;
            callback(this.balance.value);
            dispose();
        })
    }

    sendTransaction = ({ from, to, value, data }: { from?: string, to: string; value?: string; data?: string;  }) => {
        if (!this.account.value) return;
        return window.conflux!.request({ method: 'cfx_sendTransaction', params: [{
            from: from ?? this.account.value,
            to,
            data,
            value: !!value ? ('0x' + (+value!).toString(16)) : '0x0',
        }] });
    }

    addEVMChain = () => {
        if (!this.account.value) return;

        return window.conflux!.request({
            method: 'wallet_addConfluxChain',
            params: [{
                chainId: '0x406',
                chainName: 'EVM Conflux',
                nativeCurrency: {
                    name: 'Conflux',
                    symbol: 'CFX',
                    decimals: 18,
                },
                rpcUrls: ['http://47.104.89.179:12537'],
                blockExplorerUrls: ['https://confluxscan.io'],
            }]
        });
    }
}

const Manage = new FluentManage();

export const connect = Manage.connect;
export const startTrackBalance = Manage.startTrackBalance;
export const stopTrackBalance = Manage.stopTrackBalance;
export const sendTransaction = Manage.sendTransaction;
export const trackBalanceChangeOnce = Manage.trackBalanceChangeOnce;
export const addEVMChain = Manage.addEVMChain;

export default Manage;