import {optParam} from '@fluent-wallet/spec'
import BN from 'bn.js'
import {formatUnits} from '@ethersproject/units'

export const NAME = 'cfx_estimate1559Fee'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: [
    'eth_getBlockByNumber',
    'eth_feeHistory',
    'wallet_network1559Compatible',
    'cfx_gasPrice',
  ],
  db: [],
}

const MIN_GAS_PRICE = new BN('1000000000') // 1 gwei

const SETTINGS_BY_PRIORITY_LEVEL = {
  low: {
    baseFeePercentageMultiplier: new BN(90),
    minSuggestedMaxPriorityFeePerGas: new BN(90),
  },
  medium: {
    baseFeePercentageMultiplier: new BN(100),
    minSuggestedMaxPriorityFeePerGas: new BN(100),
  },
  high: {
    baseFeePercentageMultiplier: new BN(120),
    minSuggestedMaxPriorityFeePerGas: new BN(120),
  },
}

/**
 * A gas fee estimates based on gas fees that have been used in the recent past tx.
 * @param {*} param
 */
export const main = async ({
  Err: {InvalidParams},
  rpcs: {wallet_network1559Compatible, cfx_gasPrice},
  network,
}) => {
  const network1559Compatible = await wallet_network1559Compatible()
  if (!network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )

  const gasPrice = await cfx_gasPrice()
  const gasPrice_bn = new BN(Number(gasPrice))
  const gasInfo = Object.fromEntries(
    Object.entries(SETTINGS_BY_PRIORITY_LEVEL).map(([level, settings]) => [
      level,
      {
        suggestedMaxPriorityFeePerGas: formatUnits(
          BN.max(
            MIN_GAS_PRICE,
            gasPrice_bn.mul(settings.baseFeePercentageMultiplier).divn(100),
          ).toString(),
          'gwei',
        ),
        suggestedMaxFeePerGas: formatUnits(
          BN.max(
            MIN_GAS_PRICE,
            gasPrice_bn
              .mul(settings.minSuggestedMaxPriorityFeePerGas)
              .divn(100),
          ).toString(),
          'gwei',
        ),
      },
    ]),
  )

  return gasInfo
}
