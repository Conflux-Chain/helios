import {useState} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {Radio, Group} from '@fluent-wallet/radio'
import {Big} from '@fluent-wallet/data-format'
import DisplayBalance from './DisplayBalance'
import NumberInput from './NumberInput'

// Amount props and onSave use base-unit decimal strings.
function TokenSpendingCapEditor({
  requestedAmount,
  currentAmount,
  decimals,
  symbol,
  dappOrigin = '',
  onSave,
}) {
  const {t} = useTranslation()
  const [amountSource, setAmountSource] = useState(
    currentAmount === requestedAmount ? 'requested' : 'custom',
  )
  const [customInput, setCustomInput] = useState(() =>
    currentAmount === requestedAmount
      ? ''
      : new Big(currentAmount).times(`1e-${decimals}`).toFixed(),
  )

  const requestedTokenAmount = new Big(requestedAmount)
    .times(`1e-${decimals}`)
    .toFixed()

  const customInputError =
    amountSource === 'custom' && (!customInput || new Big(customInput).lt(0))
      ? t('customLimitErr', {unit: symbol})
      : ''

  const handleSave = () => {
    const amount =
      amountSource === 'custom'
        ? new Big(customInput).times(`1e${decimals}`).toFixed()
        : requestedAmount

    onSave(amount)
  }

  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        <div className="mt-3 px-4">
          <div className="text-gray-80 text-sm font-medium">
            {t('spendLimitPermission')}
          </div>
          <div className="text-xs text-gray-40 my-1" id="dappOrigin">
            {t('allowSpendDes', {dapp: dappOrigin})}
          </div>
          <a
            className="cursor-pointer text-xs text-primary mt-1 hover:text-primary-dark"
            href="/"
            target="_blank"
            id="learnMore"
          >
            {t('learnMore')}
          </a>
        </div>
        <div className="px-3 mt-3">
          <Group
            value={amountSource}
            onChange={e => {
              setAmountSource(e.target.value)
              if (e.target.value === 'requested') {
                setCustomInput('')
              }
            }}
            name="choice"
          >
            <Radio
              value="requested"
              id="recommend"
              wrapperClassName="w-full bg-gray-4 rounded border border-solid border-gray-4 pl-3 items-center py-4 mb-3"
            >
              <div className="pl-3">
                <div className="text-gray-80 text-sm font-medium">
                  {t('proposedApprovalLimit')}
                </div>
                <div className="text-xs text-gray-60 mt-1 mb-0.5">
                  {t('proposedApprovalLimitDes', {dapp: dappOrigin})}
                </div>
                <div className="flex">
                  <DisplayBalance
                    balance={requestedTokenAmount}
                    maxWidth={252}
                    maxWidthStyle="max-w-[252px]"
                  />
                  <div className="text-gray-60 text-sm">&nbsp;{symbol}</div>
                </div>
              </div>
            </Radio>
            <Radio
              value="custom"
              id="custom"
              wrapperClassName="w-full bg-gray-4 rounded border border-solid border-gray-4 pl-3 py-4"
              radioClassName="pt-3"
            >
              <div className="px-3">
                <div className="text-gray-80 text-sm font-medium">
                  {t('customSpendLimit')}
                </div>
                <div className="text-xs text-gray-60 mt-1 mb-2">
                  {t('customSpendLimitDes')}
                </div>

                <NumberInput
                  id="customAllowance"
                  size="medium"
                  readonly={amountSource === 'requested'}
                  value={customInput}
                  errorMessage={customInputError}
                  onChange={setCustomInput}
                  suffix={<div>{symbol}</div>}
                  suffixWrapperClassName="w-max"
                  decimals={decimals}
                  width="w-full"
                />
              </div>
            </Radio>
          </Group>
        </div>
      </main>
      <footer>
        <Button
          className="w-70 mx-auto mb-6"
          id="savePermission"
          disabled={!!customInputError}
          onClick={handleSave}
        >
          {t('set')}
        </Button>
      </footer>
    </div>
  )
}

TokenSpendingCapEditor.propTypes = {
  requestedAmount: PropTypes.string.isRequired,
  currentAmount: PropTypes.string.isRequired,
  decimals: PropTypes.number.isRequired,
  symbol: PropTypes.string.isRequired,
  dappOrigin: PropTypes.string,
  onSave: PropTypes.func.isRequired,
}

export default TokenSpendingCapEditor
