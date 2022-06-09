import PropTypes from 'prop-types'
import {isUndefined} from '@fluent-wallet/checks'
import {useState} from 'react'
import {RPC_METHODS} from '../../../constants'
import {TextFieldWithEditIcon} from '../../../components'

const {WALLET_UPDATE_ACCOUNT_GROUP, WALLET_UPDATE_ACCOUNT} = RPC_METHODS

function TextNickNameComponent({
  nickname,
  updateEditedName,
  accountGroupId,
  accountId,
}) {
  const [inputNickname, setInputNickname] = useState(nickname)

  const onUpdateAccountGroupName = () => {
    let params = {
      nickname: inputNickname,
    }
    let method
    if (!isUndefined(accountId)) {
      params['accountId'] = accountId
      method = WALLET_UPDATE_ACCOUNT
    } else if (!isUndefined(accountGroupId)) {
      params['accountGroupId'] = accountGroupId
      method = WALLET_UPDATE_ACCOUNT_GROUP
    }

    if (method) {
      return updateEditedName(
        {
          ...params,
        },
        method,
      )
    }
  }

  return (
    <TextFieldWithEditIcon
      inputClassName="border-none pointer-events-none"
      textValue={nickname}
      inputValue={inputNickname}
      onUpdateAccountGroupName={onUpdateAccountGroupName}
      onInputChange={setInputNickname}
      className="text-gray-40 ml-1"
      fontSize="!text-xs"
      height="!h-4"
    />
  )
}

TextNickNameComponent.propTypes = {
  nickname: PropTypes.string,
  accountGroupId: PropTypes.number,
  accountId: PropTypes.number,
  updateEditedName: PropTypes.func.isRequired,
}

export default TextNickNameComponent
