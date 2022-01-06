import PropTypes from 'prop-types'
import {useState, useRef} from 'react'
import Input from '@fluent-wallet/component-input'
import {useTranslation} from 'react-i18next'
import {KeyOutlined, EditOutlined} from '@fluent-wallet/component-icons'
import {Avatar, WrapIcon} from '../../../components'
import {RPC_METHODS} from '../../../constants'
const {WALLET_EXPORT_ACCOUNT} = RPC_METHODS

function AccountItem({
  groupType = '',
  accountEid = '',
  accountNickname = '',
  onOpenConfirmPassword,
}) {
  const {t} = useTranslation()
  const inputRef = useRef(null)
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)
  const [inputNickname, setInputNickname] = useState(accountNickname)

  const onClickEditBtn = () => {
    setShowInputStatus(true)
    setTimeout(() => {
      inputRef.current.focus()
    })
  }
  const onInputBlur = () => {
    setShowInputStatus(false)
  }
  return (
    <div
      aria-hidden="true"
      className="flex px-3 py-3.5 rounded hover:bg-primary-4 items-center"
    >
      <Avatar
        className="w-5 h-5 mr-2"
        diameter={20}
        accountIdentity={accountEid}
      />
      <div className="flex-1 flex items-center text-ellipsis">
        <div className="text-gray-80 relative h-[18px]">
          {!showInputStatus && (
            <div
              className="flex"
              onMouseEnter={() => setShowEditIconStatus(true)}
              onMouseLeave={() => setShowEditIconStatus(false)}
            >
              <div className="text-ellipsis max-w-[188px] text-sm">
                {accountNickname}
              </div>
              {showEditIconStatus && (
                <EditOutlined
                  className={
                    'ml-2 w-4 h-4 cursor-pointer text-gray-60 hover:text-primary'
                  }
                  id="edit-accountNickname"
                  onClick={onClickEditBtn}
                />
              )}
            </div>
          )}
          {
            <Input
              width="w-[188px]"
              containerClassName={`border-none absolute -top-px left-0 bg-transparent text-sm h-[18px] ${
                showInputStatus ? 'visible' : 'invisible'
              }`}
              className="!p-0 text-gray-60"
              ref={inputRef}
              value={inputNickname}
              onChange={e => setInputNickname(e.target.value)}
              onBlur={onInputBlur}
            />
          }
        </div>
      </div>
      <WrapIcon
        size="w-5 h-5"
        id="open-scan-url"
        onClick={() => {
          onOpenConfirmPassword &&
            onOpenConfirmPassword(WALLET_EXPORT_ACCOUNT, accountEid)
        }}
      >
        <KeyOutlined className="w-3 h-3 text-primary" />
      </WrapIcon>
      {groupType === 'pk' && (
        <div
          aria-hidden="true"
          className="text-xs cursor-pointer text-gray-60 hover:text-primary ml-3"
        >
          {t('hide')}
        </div>
      )}
    </div>
  )
}

AccountItem.propTypes = {
  groupType: PropTypes.string,
  accountEid: PropTypes.number,
  accountNickname: PropTypes.string,
  onOpenConfirmPassword: PropTypes.func,
}

export default AccountItem
