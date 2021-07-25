import {MethodRegistry} from 'eth-method-registry'
import {fetchWithStorage} from '@cfxjs/utils'
import {
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_ROPSTEN_RPC_ENDPOINT,
  ETH_FOUR_BYTE_DOMAIN,
} from '@cfxjs/fluent-wallet-consts'

import Eth from 'ethjs'

const getEthMethodName = async fourBytePrefix => {
  const res = await fetchWithStorage(
    'get',
    `${ETH_FOUR_BYTE_DOMAIN}/api/v1/signatures/?hex_signature=${fourBytePrefix}`,
    {
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      mode: 'cors',
    },
  )

  if (res?.count === 1) {
    return res.results[0].text_signature
  }
  return null
}

const provider = new Eth.HttpProvider(
  import.meta.env.NODE_ENV === 'production'
    ? ETH_MAINNET_RPC_ENDPOINT
    : ETH_ROPSTEN_RPC_ENDPOINT,
)

const registry = new MethodRegistry({provider})

export default async transactionData => {
  try {
    const fourBytePrefix = transactionData.substr(0, 10)
    const fourByteSig = getEthMethodName(fourBytePrefix).catch(() => {
      return null
    })

    let sig = await registry.lookup(fourBytePrefix)

    if (!sig) {
      sig = await fourByteSig
    }

    const parsedResult = registry.parse(sig)

    return {
      fullName: sig,
      name: parsedResult.name,
      params: parsedResult.args,
    }
  } catch (error) {
    return {}
  }
}
