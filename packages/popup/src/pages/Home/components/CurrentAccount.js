import {useRPC} from '@fluent-wallet/use-rpc'
import {ArrowRight, Copy, QRcode} from '@fluent-wallet/component-icons'
import {validateBase32Address} from '@fluent-wallet/base32-address'
import {
  shortenCfxAddress,
  shortenEthAddress,
} from '@fluent-wallet/shorten-address'
import {
  GET_CURRENT_ACCOUNT,
  GET_CURRENT_NETWORK,
} from '../../../constants/rpcDeps'

function CurrentAccount() {
  const {data: currentNetwork} = useRPC(GET_CURRENT_NETWORK, undefined, {
    fallbackData: {},
  })
  const {networkId} = currentNetwork
  const {data: currentAccount} = useRPC(
    GET_CURRENT_ACCOUNT.push(networkId),
    undefined,
    {fallbackData: {}},
  )
  const {nickname = 'Account 3'} = currentAccount
  // const {address} = useRPC(
  //   GET_ACCOUNT_ADDRESS,
  //   {accountId, networkId},
  //   {
  //     fallbackData: {},
  //   },
  // )
  const address = 'cfxtest:aame5p2tdzfsc3zsmbg1urwkg5ax22epg27cnu1rwm'
  const shortenAddress = validateBase32Address(address)
    ? shortenCfxAddress(address)
    : shortenEthAddress(address)

  return (
    <div className="flex flex-col">
      <div className="flex items-center cursor-pointer">
        <span className="text-xs text-gray-40 mr-2">{nickname}</span>
        <ArrowRight className="w-3 h-3 text-white" />
      </div>
      <div className="flex items-center">
        <span className="text-white font-medium mr-2">{shortenAddress}</span>
        <Copy className="cursor-pointer w-4 h-4 mg-2 text-white" />
        <QRcode className="cursor-pointer w-4 h-4 text-white" />
      </div>
    </div>
  )
}

export default CurrentAccount
