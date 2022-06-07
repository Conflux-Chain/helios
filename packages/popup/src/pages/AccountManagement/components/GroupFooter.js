import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Message from '@fluent-wallet/component-message'

import {RPC_METHODS} from '../../../constants'

const {WALLET_EXPORT_ACCOUNT_GROUP, WALLET_DELETE_ACCOUNT_GROUP} = RPC_METHODS

function GroupFooter({
  onOpenConfirmPassword,
  accountGroupId,
  showDelete = false,
  accounts = [],
}) {
  const {t} = useTranslation()

  const onDeleteAccountGroup = () => {
    if (accounts.find(({selected}) => !!selected)) {
      return Message.warning({
        content: t('groupDeleteWarning'),
        top: '10px',
        duration: 1,
      })
    }
    onOpenConfirmPassword?.(WALLET_DELETE_ACCOUNT_GROUP, {
      accountGroupId,
    })
  }
  return (
    <div className="flex justify-between mx-3 py-4 border-t border-gray-10 text-xs cursor-pointer text-gray-60">
      <div
        className="hover:text-primary"
        onClick={() =>
          onOpenConfirmPassword?.(WALLET_EXPORT_ACCOUNT_GROUP, {
            accountGroupId,
          })
        }
        aria-hidden="true"
      >
        {t('viewSeed')}
      </div>
      {showDelete && (
        <div
          aria-hidden="true"
          className="hover:text-primary"
          onClick={onDeleteAccountGroup}
        >
          {t('delete')}
        </div>
      )}
    </div>
  )
}

GroupFooter.propTypes = {
  onOpenConfirmPassword: PropTypes.func,
  accountGroupId: PropTypes.number,
  showDelete: PropTypes.bool,
  accounts: PropTypes.array,
}

export default GroupFooter
