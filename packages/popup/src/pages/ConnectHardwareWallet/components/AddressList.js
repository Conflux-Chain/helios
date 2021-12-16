import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import {DEFAULT_CFX_HDPATH} from '@fluent-wallet/consts'
import {TitleNav, CompWithLabel} from '../../../components'

function AddressList() {
  const {t} = useTranslation()

  return (
    <div className="w-120">
      <TitleNav title={t('chooseAddress')} hasGoBack={false} />
      <CompWithLabel
        label={<p className="text-sm text-gray-40">{t('selectNetwork')}</p>}
      >
        <Input
          value={'searchContent'}
          width="w-full box-border"
          readonly
          className="pointer-events-none"
          id="searchContent"
        />
      </CompWithLabel>
    </div>
  )
}
export default AddressList
