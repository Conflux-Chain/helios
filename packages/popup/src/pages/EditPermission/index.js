import {useState, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {TitleNav} from '../../components'
import {Radio} from '@fluent-wallet/radio'

/* eslint-disable react/prop-types */
function EditPermission() {
  const {t} = useTranslation()
  const [checkValue, setCheckValue] = useState('1')

  return (
    <div
      id="editPermissionContainer"
      className="h-full flex flex-col bg-blue-circles bg-no-repeat bg-bg"
    >
      <div className="flex-1">
        <TitleNav title={t('editPermission')} />
        <main>
          <div>
            <div>{t('spendLimitPermission')} </div>
            <div>{t('allowSpendDes')}</div>
            <a
              className="cursor-pointer text-xs text-primary mt-1"
              href="/"
              target="_blank"
            >
              {t('learnMore')}
            </a>
          </div>
          <div>
            <Radio
              value="1"
              name="1"
              onChange={e => setCheckValue(e.target.value)}
            >
              232131
            </Radio>
            <Radio
              value="2"
              name="1"
              onChange={e => setCheckValue(e.target.value)}
            >
              232131
            </Radio>
            <Radio
              value="3"
              name="1"
              onChange={e => setCheckValue(e.target.value)}
            >
              232131
            </Radio>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EditPermission
