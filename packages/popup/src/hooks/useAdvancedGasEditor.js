import {useState} from 'react'
import {
  Big,
  convertDataToValue,
  convertDecimal,
  GWEI_DECIMALS,
} from '@fluent-wallet/data-format'
/**
 * Keep Advanced inputs separate until the user saves.
 * values keep the input text, with prices in GWei/GDrip.
 * draftTxOptions use base-unit decimal strings.
 */
export function useAdvancedGasEditor({uses1559Fees}) {
  const [draft, setDraft] = useState(null)

  /**
   * Read prices from currentTx and saved user choices from txOptions.
   * Without a user choice, the view supplies the current gas limit.
   */
  const startEditing = ({currentTx, txOptions}) => {
    setDraft({
      initialTxOptions: txOptions,
      initialValues: {
        gasPrice: convertDataToValue(currentTx.gasPrice || '', GWEI_DECIMALS),
        maxFeePerGas: convertDataToValue(
          currentTx.maxFeePerGas || '',
          GWEI_DECIMALS,
        ),
        maxPriorityFeePerGas: convertDataToValue(
          currentTx.maxPriorityFeePerGas || '',
          GWEI_DECIMALS,
        ),
        gasLimit: txOptions?.gasLimit,
        nonce: txOptions?.nonce || '',
      },
      changes: {},
    })
  }

  const updateField = (field, value) => {
    setDraft(current => ({
      ...current,
      changes: {...current.changes, [field]: value},
    }))
  }

  // Clear the draft and return to the fee options.
  const reset = () => setDraft(null)

  const values = draft ? {...draft.initialValues, ...draft.changes} : null

  let draftTxOptions = null

  if (draft) {
    draftTxOptions = {...draft.initialTxOptions}

    // Saving Advanced keeps all displayed prices as explicit values.
    if (uses1559Fees) {
      draftTxOptions.maxFeePerGas = convertDecimal(
        values.maxFeePerGas,
        'multiply',
        GWEI_DECIMALS,
      )
      draftTxOptions.maxPriorityFeePerGas = convertDecimal(
        values.maxPriorityFeePerGas,
        'multiply',
        GWEI_DECIMALS,
      )
    } else {
      draftTxOptions.gasPrice = convertDecimal(
        values.gasPrice,
        'multiply',
        GWEI_DECIMALS,
      )
    }

    const {gasLimit, nonce} = draft.changes

    // Keep '' for automatic values.
    if (gasLimit !== undefined) {
      draftTxOptions.gasLimit =
        gasLimit === '' ? '' : new Big(gasLimit).toFixed()
    }
    if (nonce !== undefined) {
      draftTxOptions.nonce = nonce === '' ? '' : new Big(nonce).toFixed()
    }
  }

  return {
    isEditing: draft !== null,
    values,
    draftTxOptions,
    startEditing,
    updateField,
    reset,
  }
}
