import {BigNumber} from '@ethersproject/bignumber'
import {toHexQuantity} from '@fluent-wallet/utils'
import {createBundlerClient} from '@fluent-wallet/bundler-client'
import {EIP7702_NETWORK_CONFIGS} from '@fluent-wallet/consts'
import {Bytes, Uint, ethHexAddress, map, oneOrMore} from '@fluent-wallet/spec'
import {
  EIP7702_AUTHORIZATION_STUB_SIGNATURE,
  SMART_ACCOUNT_7702_STUB_SIGNATURE,
  createUserOperationForEstimate,
  encodeAccountCalls,
  mergeUserOperationGasEstimate,
} from '@fluent-wallet/user-operation'

export const NAME = 'wallet_prepareUserOperation'

const callSchema = [
  map,
  {closed: true},
  ['to', ethHexAddress],
  ['value', {optional: true}, Uint],
  ['data', {optional: true}, Bytes],
]

const authorizationSchema = [
  map,
  {closed: true},
  ['chainId', Uint],
  ['address', ethHexAddress],
  ['nonce', Uint],
]

export const schemas = {
  input: [
    map,
    {closed: true},
    ['sender', ethHexAddress],
    ['nonce', Uint],
    ['calls', [oneOrMore, callSchema]],
    ['authorization', {optional: true}, authorizationSchema],
    ['paymaster', {optional: true}, ethHexAddress],
    ['paymasterData', {optional: true}, Bytes],
  ],
}

export const permissions = {
  external: [],
  methods: [],
  db: [],
}

const GAS_LIMIT_FIELDS = [
  'verificationGasLimit',
  'callGasLimit',
  'paymasterVerificationGasLimit',
  'paymasterPostOpGasLimit',
  'preVerificationGas',
]

function calculateMaxGasCost(userOperation) {
  const totalGasLimit = GAS_LIMIT_FIELDS.reduce(
    (total, field) => total.add(userOperation[field] ?? 0),
    BigNumber.from(0),
  )

  return toHexQuantity(totalGasLimit.mul(userOperation.maxFeePerGas))
}
export const main = async ({
  Err: {InvalidParams},
  params: {sender, nonce, calls, authorization, paymaster, paymasterData},
  network,
}) => {
  const networkConfig = EIP7702_NETWORK_CONFIGS[network.chainId]
  if (!networkConfig) {
    throw InvalidParams(
      `UserOperation is not supported on network ${network.name}`,
    )
  }

  const {bundlerEndpoint, entryPointAddress} = networkConfig
  const bundlerClient = createBundlerClient({endpoint: bundlerEndpoint})
  const {standard: gasPrice} = await bundlerClient.getUserOperationGasPrice()

  const userOperationForEstimate = createUserOperationForEstimate({
    sender,
    nonce,
    callData: encodeAccountCalls(calls),
    maxFeePerGas: gasPrice.maxFeePerGas,
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
    signature: SMART_ACCOUNT_7702_STUB_SIGNATURE,
    paymaster,
    paymasterData,
    authorization: authorization
      ? {...authorization, ...EIP7702_AUTHORIZATION_STUB_SIGNATURE}
      : undefined,
  })

  const gasEstimate = await bundlerClient.estimateUserOperationGas(
    userOperationForEstimate,
    entryPointAddress,
  )

  const userOperation = mergeUserOperationGasEstimate(
    userOperationForEstimate,
    gasEstimate,
  )

  return {
    userOperation,
    maxGasCost: calculateMaxGasCost(userOperation),
  }
}
