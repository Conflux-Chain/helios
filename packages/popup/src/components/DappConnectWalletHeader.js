function DappConnectWalletHeader() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
        <img src="" alt="favicon" className="w-8 h-8" />
      </div>
      <div className="w-2 h-2 border-solid border-primary border-2 rounded-full ml-2" />
      <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
      <img src="images/paperclip.svg" alt="connecting" className="w-4 h-4" />
      <div className="border border-gray-40 border-dashed w-[42px] mx-1" />
      <div className="w-2 h-2 border-solid border-primary border-2 rounded-full mr-2" />
      <div className="w-12 h-12 rounded-full border-solid border-gray-20 border flex items-center justify-center">
        <img className="w-8 h-8" src="images/logo.svg" alt="logo" />
      </div>
    </div>
  )
}

export default DappConnectWalletHeader
