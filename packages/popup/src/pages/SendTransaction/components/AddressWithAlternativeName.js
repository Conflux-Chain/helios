import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import Tooltip from '@fluent-wallet/component-tooltip'
import {CustomTag, NsNameLabel} from '../../../components'
import {AddressCheckedSymbol} from './'

function AddressWithAlternativeName({
  onClickCloseBtn,
  address = '',
  displayNoteName = '',
  nsName = '',
}) {
  const {t} = useTranslation()

  return (
    <div className="border-solid border-gray-20 border rounded-sm px-3 py-2 flex items-center justify-between">
      <div>
        <div className="flex items-center">
          {nsName && <NsNameLabel nsName={nsName} className="mr-3" />}
          {displayNoteName && (
            <CustomTag
              backgroundColor="bg-primary-10"
              roundedStyle="rounded"
              width="max-w-[108px] min-w-[24px]"
              className="h-auto"
            >
              <Tooltip
                content={
                  <div>
                    <div>{t('alternativeName')}</div>
                    <div>{displayNoteName}</div>
                  </div>
                }
              >
                <div className="text-primary text-ellipsis p-1">
                  {displayNoteName}
                </div>
              </Tooltip>
            </CustomTag>
          )}
        </div>

        <div>{address ? shortenAddress(address) : ''}</div>
      </div>
      <AddressCheckedSymbol
        checked={true}
        className="!w-5 !h-5 text-success"
        onClickCloseBtn={onClickCloseBtn}
      />
    </div>
  )
}

AddressWithAlternativeName.propTypes = {
  onClickCloseBtn: PropTypes.func,
  displayNoteName: PropTypes.string,
  address: PropTypes.string,
  nsName: PropTypes.string,
}

export default AddressWithAlternativeName
