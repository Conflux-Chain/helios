import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav, DisplayBalance, NumberInput} from '../../components'
import {Radio, Group} from '@fluent-wallet/radio'
import {Big} from '@fluent-wallet/data-format'

/* eslint-disable react/prop-types */
function EditPermission({
  amount = '1000919291921929',
  symbol = 'cUSDT',
  decimal = 4,
  defaultLimit = '128',
  siteName = 'shutFlow',
}) {
  const {t} = useTranslation()
  const [permissionChoice, setPermissionChoice] = useState('recommend')
  const [customLimitValue, setCustomLimitValue] = useState(defaultLimit)
  const [customLimitErr, setCustomLimitErr] = useState('')

  const onChangeCustomInput = value => {
    setCustomLimitValue(value)
  }

  useEffect(() => {
    setCustomLimitErr(
      new Big(customLimitValue).gt(0)
        ? ''
        : t('customLimitErr', {unit: symbol}),
    )
  }, [customLimitValue, t, symbol])

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
              {t('allowSpendDes', {dapp: siteName})}
            </div>
            <a
              className="cursor-pointer text-xs text-primary mt-1"
              href="/"
              target="_blank"
            >
              {t('learnMore')}
            </a>
          </div>
          <div className="px-3">
            <Group
              value={permissionChoice}
              onChange={e => setPermissionChoice(e.target.value)}
              name="choice"
            >
              <Radio
                value="recommend"
                wrapperClassName="w-full bg-gray-4 rounded border border-solid	border-gray-10 pl-3 items-center py-4"
              >
                <div className="pl-3">
                  <div className="text-gray-80 text-sm font-medium">
                    {t('proposedApprovalLimit')}
                  </div>
                  <div className="text-xs text-gray-60 mt-1 mb-0.5">
                    {t('proposedApprovalLimitDes', {dapp: siteName})}
                  </div>
                  <div className="flex">
                    <DisplayBalance
                      balance={amount}
                      maxWidth={252}
                      maxWidthStyle="max-w-[252px]"
                    />
                    <div className="text-gray-60 text-sm">&nbsp;{symbol}</div>
                  </div>
                </div>
              </Radio>
              <div className="h-3" />
              <Radio
                value="custom"
                wrapperClassName="w-full bg-gray-4 rounded border border-solid	border-gray-10 pl-3 py-4"
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
                    value={customLimitValue}
                    errorMessage={customLimitErr}
                    onInputChange={onChangeCustomInput}
                    suffix={<div>{symbol}</div>}
                    suffixWrapperClassName="w-auto"
                    decimal={decimal}
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
        >
          {t('set')}
        </Button>
      </footer>
    </div>
  )
}

export default EditPermission
