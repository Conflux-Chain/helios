import PropTypes from 'prop-types'
import {isUndefined} from '@fluent-wallet/checks'
import {useState, useRef} from 'react'
import {RPC_METHODS} from '../../../constants'
import {TextField} from '../../../components'

const {WALLET_UPDATE_ACCOUNT_GROUP, WALLET_UPDATE_ACCOUNT} = RPC_METHODS

function TextNickNameComponent({
  nickname,
  updateEditedName,
  accountGroupId,
  accountId,
}) {
  const textInputRef = useRef(null)
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
    <TextField
      inputClassName="border-none"
      textValue={nickname}
      inputValue={inputNickname}
      onSubmit={onUpdateAccountGroupName}
      onInputChange={setInputNickname}
      className="text-gray-40 ml-1"
      fontSize="!text-xs"
      height="!h-4"
      ref={textInputRef}
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
