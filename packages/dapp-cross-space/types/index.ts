type ConfluxMainNetwork = '1029'
type ConfluxTestNetwork = '1'
type ConfluxTest2Network = '1030'
type ConfluxChainId =
  | ConfluxMainNetwork
  | ConfluxTestNetwork
  | ConfluxTest2Network

type FluentEvents =
  | 'chainChanged'
  | 'accountsChanged'
  | 'connect'
  | 'disconnect'

interface Window {
  conflux?: {
    isFluent: true
    isConnected(): boolean
    on(
      event: 'connect',
      cb: (param: {chainId: ConfluxChainId; networkId: number}) => void,
    ): void
    on(event: 'disconnect', cb: (a: any) => void): void
    on(event: 'accountsChanged', cb: (accounts: Array<string>) => void): void
    on(event: 'chainChanged', cb: (chainId: ConfluxChainId) => void): void
    off(event: FluentEvents, cb: Function): void
    request(args: {method: 'cfx_requestAccounts'}): Promise<Array<string>>
    request(args: {
      method: 'wallet_getBalance'
      params: [string]
    }): Promise<string>
    request(args: {
      method: 'cfx_sendTransaction'
      params: [{from: string; to: string; value?: string; data?: string}]
    }): Promise<any>
    request(args: {method: 'wallet_addConfluxChain'; params: any}): Promise<any>
  }
}
