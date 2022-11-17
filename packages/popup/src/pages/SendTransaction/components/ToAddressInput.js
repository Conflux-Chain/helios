import PropTypes from 'prop-types'
import {useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import {ContactsOutlined, RightOutlined} from '@fluent-wallet/component-icons'

import {useAddressNote} from '../../../hooks/useApi'
import {CompWithLabel} from '../../../components'
import useGlobalStore from '../../../stores'
import {ROUTES} from '../../../constants'
import {AddressCheckingSymbol} from './'
const {ADDRESS_BOOK} = ROUTES

function ToAddressInput({address, onChangeAddress, errorMessage}) {
  const {t} = useTranslation()
  const {addressNote, setAddressNote} = useGlobalStore()
  const history = useHistory()

  const noteName = useAddressNote(
    address,
    address === Object.keys(addressNote)?.[0],
  )

  useEffect(() => {
    return () => {
      setAddressNote?.({})
    }
  }, [setAddressNote])

  const displayNoteName = addressNote?.[address] || noteName

  return (
    <CompWithLabel
      label={
        <div className="flex items-center justify-between">
          <div className="text-gray-40">{t('toAddressLabel')}</div>
          <div
            id="go-address-book"
            className="flex items-center text-primary cursor-pointer"
            aria-hidden="true"
            onClick={() => history.push(ADDRESS_BOOK)}
          >
            <ContactsOutlined className="w-[14px] h-[14px]" />
            <span className="text-primary mx-1">{t('recent')}</span>
            <RightOutlined className="w-3 h-3" />
          </div>
        </div>
      }
      className="!mt-0"
      labelClassName="!text-gray-40"
    >
      <Input
        width="w-full"
        value={address}
        placeholder={t('toAddressPlaceholder')}
        onChange={e => onChangeAddress && onChangeAddress(e.target.value)}
        errorMessage={errorMessage}
        id="toAddressInput"
        suffixWrapperClassName="w-auto h-auto"
        suffix={<AddressCheckingSymbol className="!w-5 !h-5 text-success" />}
        // TODO：挪到别的地方了
        // suffix={
        //   displayNoteName && (
        //     <CustomTag
        //       backgroundColor="bg-primary-10"
        //       roundedStyle="rounded"
        //       width="max-w-[60px] min-w-[24px]"
        //       className="h-auto"
        //     >
        //       <div className="text-primary text-ellipsis p-1">
        //         {displayNoteName}
        //       </div>
        //     </CustomTag>
        //   )
        // }
      />
    </CompWithLabel>
  )
}

ToAddressInput.propTypes = {
  address: PropTypes.string,
  onChangeAddress: PropTypes.func,
  errorMessage: PropTypes.string,
}

export default ToAddressInput
