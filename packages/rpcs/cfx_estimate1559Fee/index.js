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
    'wallet_network1559Compatible',
    'cfx_feeHistory',
    'cfx_getBlockByEpochNumber',
  ],
  db: [],
}

const FEE_HISTORY_BLOCKS = '0x5'
const PRIORITY_LEVELS = ['low', 'medium', 'high']
const MIN_GAS_PRICE = new BN('1000000000') // 1 gwei

const SETTINGS_BY_PRIORITY_LEVEL = {
  low: {
    percentile: 10,
    baseFeePercentageMultiplier: new BN(90),
    // minSuggestedMaxPriorityFeePerGas: new BN(0)
  },
  medium: {
    percentile: 20,
    baseFeePercentageMultiplier: new BN(100),
    // minSuggestedMaxPriorityFeePerGas: new BN(0)
  },
  high: {
    percentile: 30,
    baseFeePercentageMultiplier: new BN(120),
    // minSuggestedMaxPriorityFeePerGas: new BN(0)
  },
}

const FEE_HISTORY_PERCENTILES = [
  SETTINGS_BY_PRIORITY_LEVEL.low.percentile,
  SETTINGS_BY_PRIORITY_LEVEL.medium.percentile,
  SETTINGS_BY_PRIORITY_LEVEL.high.percentile,
]

/**
 * A gas fee estimates based on gas fees that have been used in the recent past tx.
 * @param {*} param
 */
export const main = async ({
  Err: {InvalidParams},
  rpcs: {
    wallet_network1559Compatible,
    cfx_feeHistory,
    cfx_getBlockByEpochNumber,
  },
  network,
}) => {
  const network1559Compatible = await wallet_network1559Compatible()
  if (!network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )

  const latestBlock = await cfx_getBlockByEpochNumber(['latest_state', false])
  const baseFeePerGas = new BN(Number(latestBlock?.baseFeePerGas))
  const feeData = await cfx_feeHistory([
    FEE_HISTORY_BLOCKS,
    'latest_state',
    FEE_HISTORY_PERCENTILES,
  ])

  const gasInfo = calculateGasFeeEstimatesForPriorityLevels(
    feeData,
    baseFeePerGas,
  )
  return gasInfo
}

function calculateGasFeeEstimatesForPriorityLevels(feeData, baseFeePerGas) {
  const levelSpecificEstimates = PRIORITY_LEVELS.reduce(
    (obj, priorityLevel) => {
      const gasEstimatesForPriorityLevel = calculateEstimatesForPriorityLevel(
        priorityLevel,
        feeData,
        baseFeePerGas,
      )
      return {...obj, [priorityLevel]: gasEstimatesForPriorityLevel}
    },
    {},
  )
  return {
    ...levelSpecificEstimates,
    estimatedBaseFee: formatUnits(baseFeePerGas.toString(), 'gwei'),
  }
}

function calculateEstimatesForPriorityLevel(
  priorityLevel,
  feeData,
  baseFeePerGas,
) {
  const settings = SETTINGS_BY_PRIORITY_LEVEL[priorityLevel]
  const adjustedBaseFeePerGas = baseFeePerGas
    .mul(settings.baseFeePercentageMultiplier)
    .divn(100)
  const priorityFees = feeData.reward
    ?.map(
      rewards =>
        new BN(Number(rewards[PRIORITY_LEVELS.indexOf(priorityLevel)])),
    )
    .filter(BN.isBN)
  const adjustedPriorityFee = medianOf(priorityFees)

  // const suggestedMaxPriorityFeePerGas = BN.max(
  //   adjustedPriorityFee,
  //   settings.minSuggestedMaxPriorityFeePerGas,
  // )
  const suggestedMaxPriorityFeePerGas = adjustedPriorityFee

  const suggestedMaxFeePerGas = adjustedBaseFeePerGas.add(
    suggestedMaxPriorityFeePerGas,
  )
  return {
    suggestedMaxPriorityFeePerGas: formatUnits(
      suggestedMaxPriorityFeePerGas.toString(),
      'gwei',
    ),
    suggestedMaxFeePerGas: formatUnits(
      BN.max(suggestedMaxFeePerGas, MIN_GAS_PRICE).toString(),
      'gwei',
    ),
  }
}

function medianOf(numbers) {
  const sortedNumbers = numbers.slice().sort((a, b) => a.cmp(b))
  const len = sortedNumbers.length
  const index = Math.floor((len - 1) / 2)
  return sortedNumbers[index]
}
