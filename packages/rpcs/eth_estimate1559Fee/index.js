import {optParam} from '@fluent-wallet/spec'
import BN from 'bn.js'

//TODO: will be supported after in-depth research by various wallets' code and  doc
export const NAME = 'eth_estimate1559Fee'

export const schemas = {
  input: optParam,
}

export const permissions = {
  external: ['popup', 'inpage'],
  locked: true,
  methods: ['eth_getBlockByNumber', 'eth_feeHistory'],
  db: [],
}

const PRIORITY_LEVELS = ['low', 'medium', 'high']
const SETTINGS_BY_PRIORITY_LEVEL = {
  low: {
    percentile: 10,
    baseFeePercentageMultiplier: new BN(110),
    priorityFeePercentageMultiplier: new BN(94),
    minSuggestedMaxPriorityFeePerGas: new BN(1_000_000_000),
  },
  medium: {
    percentile: 20,
    baseFeePercentageMultiplier: new BN(120),
    priorityFeePercentageMultiplier: new BN(97),
    minSuggestedMaxPriorityFeePerGas: new BN(1_500_000_000),
  },
  high: {
    percentile: 30,
    baseFeePercentageMultiplier: new BN(125),
    priorityFeePercentageMultiplier: new BN(98),
    minSuggestedMaxPriorityFeePerGas: new BN(2_000_000_000),
  },
}
/**
 * A gas fee estimates based on gas fees that have been used in the recent past tx.
 * @param {*} param
 */
export const main = async ({rpcs: {eth_feeHistory}}) => {
  // const latestBlock = await eth_getBlockByNumber(['latest', false])
  const blocks = await eth_feeHistory([5, 'latest', [10, 20, 30]])
  const levelSpecificEstimates =
    calculateGasFeeEstimatesForPriorityLevels(blocks)
  return {
    ...levelSpecificEstimates,
  }
}

function calculateGasFeeEstimatesForPriorityLevels(blocks) {
  return PRIORITY_LEVELS.reduce((obj, priorityLevel) => {
    const gasEstimatesForPriorityLevel = calculateEstimatesForPriorityLevel(
      priorityLevel,
      blocks,
    )
    return {...obj, [priorityLevel]: gasEstimatesForPriorityLevel}
  })
}

function calculateEstimatesForPriorityLevel(priorityLevel, blocks) {
  const settings = SETTINGS_BY_PRIORITY_LEVEL[priorityLevel]

  const latestBaseFeePerGas = blocks[blocks.length - 1].baseFeePerGas
  const adjustedBaseFee = latestBaseFeePerGas
    .mul(settings.baseFeePercentageMultiplier)
    .divn(100)
  const priorityFees = blocks
    .map(block => {
      return 'priorityFeesByPercentile' in block
        ? block.priorityFeesByPercentile[settings.percentile]
        : null
    })
    .filter(BN.isBN)
  const medianPriorityFee = medianOf(priorityFees)
  const adjustedPriorityFee = medianPriorityFee
    .mul(settings.priorityFeePercentageMultiplier)
    .divn(100)

  const suggestedMaxPriorityFeePerGas = BN.max(
    adjustedPriorityFee,
    settings.minSuggestedMaxPriorityFeePerGas,
  )
  const suggestedMaxFeePerGas = adjustedBaseFee.add(
    suggestedMaxPriorityFeePerGas,
  )
  return {
    ...settings.estimatedWaitTimes,
    suggestedMaxPriorityFeePerGas: suggestedMaxPriorityFeePerGas,
    suggestedMaxFeePerGas: suggestedMaxFeePerGas,
  }
}

function medianOf(numbers) {
  const sortedNumbers = numbers.slice().sort((a, b) => a.cmp(b))
  const len = sortedNumbers.length
  const index = Math.floor((len - 1) / 2)
  return sortedNumbers[index]
}
