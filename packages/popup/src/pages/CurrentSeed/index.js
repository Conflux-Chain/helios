import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {Selected} from '@cfxjs/component-icons'
import {CompWithLabel, TitleNav} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import {request} from '../../utils'
import {GET_HD_ACCOUNT_GROUP} from '../../constants/rpcDeps'

function SeedPhrase({group, idx, selectedGroupIdx, onClickGroup}) {
  const {t} = useTranslation()
  const {
    account: {length},
    nickname,
  } = group

  return (
    <div
      role="menuitem"
      tabIndex="-1"
      key={group.eid}
      className="h-12 px-3 hover:bg-primary-4 flex items-center cursor-pointer justify-between"
      onClick={() => onClickGroup && onClickGroup(idx)}
      onKeyDown={() => {}}
    >
      <div className="flex items-center">
        <span className="text-gray-80 mr-2">{nickname}</span>
        <span className="text-gray-40">
          {length === 1
            ? t('oneAccount')
            : t('manyAccounts', {accountNum: length})}
        </span>
      </div>
      {idx === selectedGroupIdx && <Selected className="w-5 h-5" />}
    </div>
  )
}

SeedPhrase.propTypes = {
  group: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  selectedGroupIdx: PropTypes.number.isRequired,
  onClickGroup: PropTypes.func.isRequired,
}

function CurrentSeed() {
  const {t} = useTranslation()
  const {data: hdGroup, mutate: groupMutate} = useRPC(
    GET_HD_ACCOUNT_GROUP,
    {type: 'hd'},
    {fallbackData: []},
  )

  const [accountName, setAccountName] = useState('')
  const [accountNamePlaceholder, setAccountNamePlaceholder] = useState('')
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountCreationError, setAccountCreationError] = useState('')
  useEffect(() => {
    setAccountNamePlaceholder(
      `Account-1-${hdGroup[selectedGroupIdx]?.account?.length + 1}`,
    )
  }, [hdGroup, selectedGroupIdx])
  const onClickGroup = index => {
    setSelectedGroupIdx(index)
    setAccountNamePlaceholder(
      `Account-${index + 1}-${hdGroup[index].account.length + 1}`,
    )
  }
  const onCreate = () => {
    setCreatingAccount(true)
    return request('wallet_createAccount', {
      accountGroupId: hdGroup[selectedGroupIdx].eid,
      nickname: accountName || accountNamePlaceholder,
    }).then(({error}) => {
      setCreatingAccount(false)
      if (error) {
        setAccountCreationError(error.message)
        console.log(accountCreationError)
        return
      }
      groupMutate()
      // jump to next page?
    })
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      <TitleNav title={t('newAccount')} />
      <main className="px-3 flex flex-1 flex-col">
        <CompWithLabel label={t('accountName')}>
          <Input
            width="w-full"
            value={accountName}
            maxLength="20"
            placeholder={accountNamePlaceholder}
            onChange={e => setAccountName(e.target.value)}
          />
        </CompWithLabel>
        <CompWithLabel
          label={t('selectSeedPhrase')}
          className="flex flex-1 flex-col mb-4"
        >
          <div
            role="menu"
            className="flex flex-col flex-1 overflow-y-auto py-2 bg-gray-0 rounded-sm"
          >
            {hdGroup.map(
              (g, idx) =>
                g && (
                  <SeedPhrase
                    key={g.eid}
                    group={g}
                    onClickGroup={onClickGroup}
                    selectedGroupIdx={selectedGroupIdx}
                    idx={idx}
                  />
                ),
            )}
          </div>
        </CompWithLabel>
        <div className="flex justify-center mb-4">
          <Button
            className="w-70"
            onClick={onCreate}
            disabled={
              !(
                (accountName || accountNamePlaceholder) &&
                hdGroup[selectedGroupIdx]
              ) || creatingAccount
            }
          >
            {t('create')}
          </Button>
        </div>
      </main>
    </div>
  )
}

export default CurrentSeed
