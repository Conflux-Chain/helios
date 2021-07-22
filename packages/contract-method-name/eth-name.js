import {MethodRegistry} from 'eth-method-registry'
import {fetchWithStorage} from '@cfxjs/utils'
import {
  ETH_MAINNET_RPC_ENDPOINT,
  ETH_ROPSTEN_RPC_ENDPOINT,
} from '@cfxjs/fluent-wallet-consts'

import Eth from 'ethjs'

const provider = new Eth.HttpProvider(
  import.meta.env.NODE_ENV === 'production'
    ? ETH_MAINNET_RPC_ENDPOINT
    : ETH_ROPSTEN_RPC_ENDPOINT,
)

const getMethodName = async fourBytePrefix => {
  const res = await fetchWithStorage(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${fourBytePrefix}`,
    {
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors',
    },
  )

  if (res.count === 1) {
    return res.results[0].text_signature
  }
  return null
}

let registry

export default async fourBytePrefix => {
  try {
    const fourByteSig = getMethodName(fourBytePrefix).catch(e => {
      console.log(e)
      return null
    })

    if (!registry) {
      registry = new MethodRegistry({provider})
    }

    let sig = await registry.lookup(fourBytePrefix)

    if (!sig) {
      sig = await fourByteSig
    }

    if (!sig) {
      return {}
    }

    const parsedResult = registry.parse(sig)

    return {
      name: parsedResult.name,
      params: parsedResult.args,
    }
  } catch (error) {
    console.log(error)
    return {}
  }
}
