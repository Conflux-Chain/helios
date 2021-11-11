import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {Radio, Group} from '@fluent-wallet/radio'
import {Big} from '@fluent-wallet/data-format'
import useGlobalStore from '../../stores'
import {useCurrentDapp} from '../../hooks/useApi'

/* eslint-disable react/prop-types */
function EditPermission({symbol = 'cUSDT', decimals = 4}) {
  const {t} = useTranslation()
  const history = useHistory()
  const [permissionChoice, setPermissionChoice] = useState('')
  const [customLimitValue, setCustomLimitValue] = useState('0')
  const [customLimitErr, setCustomLimitErr] = useState('')
  const {
    recommendPermissionLimit,
    customPermissionLimit,
    setCustomPermissionLimit,
  } = useGlobalStore()

  const data = useCurrentDapp()
  const site = data?.site || {}
  // TODO: should jump home page when recommendPermissionLimit value is empty

  useEffect(() => {
    if (customPermissionLimit && customPermissionLimit !== '0') {
      setPermissionChoice('custom')
    } else {
      setPermissionChoice('recommend')
    }
  }, [customPermissionLimit])

  useEffect(() => {
    if (permissionChoice === 'recommend') {
      setCustomLimitValue('0')
    }
  }, [permissionChoice])

  useEffect(() => {
    if (permissionChoice === 'recommend') {
      return setCustomLimitErr('')
    }
    setCustomLimitErr(
      new Big(customLimitValue).gt(0)
        ? ''
        : t('customLimitErr', {unit: symbol}),
    )
  }, [customLimitValue, t, symbol, permissionChoice])

  const onChangeCustomInput = e => {
    if (permissionChoice === 'recommend') {
      return
    }
    setCustomLimitValue(e.target.value)
  }

  const onSavePermissionLimit = () => {
    if (customLimitValue && customLimitValue !== '0') {
      setCustomPermissionLimit(customLimitValue)
    }
    history.goBack()
  }

  return (
    <div
      id="editPermissionContainer"
      className="h-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
    >
      <div className="flex-1">
        <TitleNav title={t('editPermission')} />
        <main>
          <div className="mt-3 px-4">
            <div className="text-gray-80 text-sm font-medium">
              {t('spendLimitPermission')}{' '}
            </div>
            <div className="text-xs text-gray-40 my-1">
              {t('allowSpendDes', {dapp: site?.origin || ''})}
            </div>
            <a
              className="cursor-pointer text-xs text-primary mt-1"
              href="/"
              target="_blank"
            >
              {t('learnMore')}
            </a>
          </div>
          <div className="px-3 mt-3">
            <Group
              value={permissionChoice}
              onChange={e => setPermissionChoice(e.target.value)}
              name="choice"
            >
              <Radio
                value="recommend"
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
                      balance={recommendPermissionLimit}
                      decimals={decimals}
                      maxWidth={252}
                      maxWidthStyle="max-w-[252px]"
                    />
                    <div className="text-gray-60 text-sm">&nbsp;{symbol}</div>
                  </div>
                </div>
              </Radio>
              <Radio
                value="custom"
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
                    size="medium"
                    readonly={permissionChoice === 'recommend'}
                    value={customLimitValue}
                    errorMessage={customLimitErr}
                    onChange={onChangeCustomInput}
                    suffix={<div>{symbol}</div>}
                    suffixWrapperClassName="w-auto"
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
          className="w-70  mx-auto mb-9"
          id="savePermission"
          disabled={permissionChoice === 'custom' && !!customLimitErr}
          onClick={onSavePermissionLimit}
        >
          {t('set')}
        </Button>
      </footer>
    </div>
  )
}

export default EditPermission
