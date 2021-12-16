import {
  Authorizing,
  OpenApp,
  PluginWallet,
  ReConnectWallet,
  SearchingWallet,
  AddressList,
} from './components'

function ConnectHardwareWallet() {
  return (
    <div
      id="connect-hardware-wallet"
      className="m-auto light flex flex-col h-full min-h-screen"
    >
      {/* <div className="flex-2" />
      <Authorizing />
      <OpenApp />
      <PluginWallet />
      <ReConnectWallet />
      <SearchingWallet />
      <div className="flex-3" /> */}
      <AddressList />
    </div>
  )
}

export default ConnectHardwareWallet
