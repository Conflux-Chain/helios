import {optParam} from '@fluent-wallet/spec'
import BN from 'bn.js'
import {formatUnits} from '@ethersproject/units'

export const NAME = 'eth_estimate1559Fee'

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
  ],
  db: [],
}
//Gas station url for EIP1559
export const GAS_API_BASE_URL = 'https://gas-api.metaswap.codefi.network'
// How many blocks to consider for priority fee estimation
const FEE_HISTORY_BLOCKS = 5
// Levels of priority fee
const PRIORITY_LEVELS = ['low', 'medium', 'high']
const SETTINGS_BY_PRIORITY_LEVEL = {
  low: {
    percentile: 10,
    baseFeePercentageMultiplier: new BN(110),
    minSuggestedMaxPriorityFeePerGas: new BN(1000000000),
  },
  medium: {
    percentile: 20,
    baseFeePercentageMultiplier: new BN(120),
    minSuggestedMaxPriorityFeePerGas: new BN(1500000000),
  },
  high: {
    percentile: 30,
    baseFeePercentageMultiplier: new BN(125),
    minSuggestedMaxPriorityFeePerGas: new BN(2000000000),
  },
}
// Which percentile of effective priority fees to include
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
  rpcs: {eth_feeHistory, eth_getBlockByNumber, wallet_network1559Compatible},
  network,
}) => {
  const network1559Compatible = await wallet_network1559Compatible()
  if (!network1559Compatible)
    throw InvalidParams(
      `Network ${network.name} don't support 1559 transaction`,
    )
  let gasInfo = {}
  //First fetch through gas station,if error occured, then fetch througe the rpc: eth_feeHistory
  try {
    gasInfo = await getGasFeeByGasStation(Number(network.chainId))
  } catch (error) {
    const latestBlock = await eth_getBlockByNumber(['latest', false])
    const baseFeePerGas = new BN(Number(latestBlock?.baseFeePerGas))
    const feeData = await eth_feeHistory([
      FEE_HISTORY_BLOCKS,
      'latest',
      FEE_HISTORY_PERCENTILES,
    ])
    gasInfo = calculateGasFeeEstimatesForPriorityLevels(feeData, baseFeePerGas)
  }
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
  const suggestedMaxPriorityFeePerGas = BN.max(
    adjustedPriorityFee,
    settings.minSuggestedMaxPriorityFeePerGas,
  )
  const suggestedMaxFeePerGas = adjustedBaseFeePerGas.add(
    suggestedMaxPriorityFeePerGas,
  )
  return {
    suggestedMaxPriorityFeePerGas: formatUnits(
      suggestedMaxPriorityFeePerGas.toString(),
      'gwei',
    ),
    suggestedMaxFeePerGas: formatUnits(
      suggestedMaxFeePerGas.toString(),
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

async function getGasFeeByGasStation(chainId) {
  const gaseFeeApiUrl = `${GAS_API_BASE_URL}/networks/${chainId}/suggestedGasFees`
  if (typeof window?.fetch === 'function') {
    const res = await fetch(gaseFeeApiUrl, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })
    if (!res.ok) {
      throw new Error(
        `Fetch failed with status '${res.status}' for request gasFeeApi`,
      )
    }
    return res.json()
  }

  return {}
}
