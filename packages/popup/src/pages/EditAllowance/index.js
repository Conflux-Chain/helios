import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {Radio, Group} from '@fluent-wallet/radio'
import {Big, convertDecimal} from '@fluent-wallet/data-format'
import {useCurrentDapp} from '../../hooks/useApi'
import {useDappParams, useDecodeData, useCurrentTxParams} from '../../hooks'

function EditAllowance() {
  const {t} = useTranslation()
  const history = useHistory()
  const tx = useDappParams()
  const {decodeData, token} = useDecodeData(tx)
  const [permissionChoice, setPermissionChoice] = useState('recommend')
  const [customLimitValue, setCustomLimitValue] = useState('')
  const [customLimitErr, setCustomLimitErr] = useState('')
  const {customAllowance, setCustomAllowance} = useCurrentTxParams()

  const {symbol, decimals} = token
  const decodeAllowance = convertDecimal(
    decodeData?.args?.[1].toString(10) || '0',
    'divide',
    decimals,
  )

  const data = useCurrentDapp()
  const site = data?.site || {}

  useEffect(() => {
    if (customAllowance) {
      setPermissionChoice('custom')
      setCustomLimitValue(customAllowance)
    } else {
      setPermissionChoice('recommend')
    }
  }, [customAllowance])

  useEffect(() => {
    if (permissionChoice === 'recommend') {
      setCustomLimitErr('')
    } else {
      setCustomLimitErr(
        customLimitValue && new Big(customLimitValue).gte(0)
          ? ''
          : t('customLimitErr', {unit: symbol}),
      )
    }
  }, [permissionChoice, customLimitValue, symbol, t])

  const onChangeCustomInput = value => {
    setCustomLimitValue(value)
  }

  const onSavePermissionLimit = () => {
    if (permissionChoice === 'custom') {
      setCustomAllowance(customLimitValue)
    } else {
      setCustomAllowance('')
    }
    history.goBack()
  }

  return (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
    >
      <div className="flex-1">
        <TitleNav title={t('editPermission')} />
        <main>
          <div className="mt-3 px-4">
            <div className="text-gray-80 text-sm font-medium">
              {t('spendLimitPermission')}{' '}
            </div>
            <div className="text-xs text-gray-40 my-1" id="dappOrigin">
              {t('allowSpendDes', {dapp: site?.origin || ''})}
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
              value={permissionChoice}
              onChange={e => {
                setPermissionChoice(e.target.value)
                if (e.target.value === 'recommend') {
                  setCustomLimitValue('')
                }
              }}
              name="choice"
            >
              <Radio
                value="recommend"
                id="recommend"
                wrapperClassName="w-full bg-gray-4 rounded border border-solid	border-gray-4 pl-3 items-center py-4 mb-3"
              >
                <div className="pl-3">
                  <div className="text-gray-80 text-sm font-medium">
                    {t('proposedApprovalLimit')}
                  </div>
                  <div className="text-xs text-gray-60 mt-1 mb-0.5">
                    {t('proposedApprovalLimitDes', {dapp: site?.origin || ''})}
                  </div>
                  <div className="flex">
                    <DisplayBalance
                      balance={decodeAllowance}
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
                wrapperClassName="w-full bg-gray-4 rounded border border-solid	border-gray-4 pl-3 py-4"
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
                    readonly={permissionChoice === 'recommend'}
                    value={customLimitValue}
                    errorMessage={customLimitErr}
                    onChange={onChangeCustomInput}
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
      </div>
      <footer>
        <Button
          className="w-70 mx-auto mb-6"
          id="savePermission"
          disabled={
            permissionChoice === 'custom' &&
            (!!customLimitErr || !customLimitValue)
          }
          onClick={onSavePermissionLimit}
        >
          {t('set')}
        </Button>
      </footer>
    </div>
  )
}

export default EditAllowance
