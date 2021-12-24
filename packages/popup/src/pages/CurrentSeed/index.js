import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useSWRConfig} from 'swr'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {CheckCircleFilled} from '@fluent-wallet/component-icons'
import {CompWithLabel, TitleNav} from '../../components'
import {request} from '../../utils'
import {RPC_METHODS, ROUTES} from '../../constants'
import {useHdAccountGroup} from '../../hooks/useApi'
import useLoading from '../../hooks/useLoading'

const {WALLET_CREATE_ACCOUNT, WALLET_ZERO_ACCOUNT_GROUP} = RPC_METHODS
const {HOME} = ROUTES

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
      {idx === selectedGroupIdx && (
        <CheckCircleFilled className="w-5 h-5 text-success" />
      )}
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
  const history = useHistory()
  const {mutate} = useSWRConfig()
  const hdGroup = useHdAccountGroup()

  const [accountName, setAccountName] = useState('')
  const [accountNamePlaceholder, setAccountNamePlaceholder] = useState('')
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0)
  const [accountCreationError, setAccountCreationError] = useState('')
  const {setLoading} = useLoading()

  useEffect(() => {
    setAccountNamePlaceholder(`Seed-1-${hdGroup[0]?.account?.length + 1}`)
  }, [hdGroup])
  const onClickGroup = index => {
    setSelectedGroupIdx(index)
    setAccountNamePlaceholder(
      `Seed-${index + 1}-${hdGroup[index].account.length + 1}`,
    )
  }
  const onCreate = () => {
    setLoading(true)
    return request(WALLET_CREATE_ACCOUNT, {
      accountGroupId: hdGroup[selectedGroupIdx].eid,
      nickname: accountName || accountNamePlaceholder,
    })
      .then(() => {
        mutate([WALLET_ZERO_ACCOUNT_GROUP], false)
        setLoading(false)
        history.push(HOME)
      })
      .catch(error => {
        setLoading(false)
        // TODO: handle error message
        setAccountCreationError(error.message ?? error)
        console.log(accountCreationError)
      })
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-bg"
      id="currentSeedContainer"
    >
      <TitleNav title={t('newAccount')} />
      <main className="px-3 flex flex-1 flex-col">
        <CompWithLabel label={t('accountName')}>
          <Input
            width="w-full"
            value={accountName}
            maxLength="20"
            placeholder={accountNamePlaceholder}
            onChange={e => setAccountName(e.target.value)}
            id="newAccountName"
          />
        </CompWithLabel>
        <CompWithLabel
          label={t('selectSeedPhrase')}
          className="flex flex-1 flex-col mb-4"
        >
          <div
            role="menu"
            id="menu"
            className="flex flex-col flex-1 overflow-y-auto py-2 bg-gray-0 rounded-sm"
          >
            {hdGroup.map(
              (g, idx) =>
                g && (
                  <SeedPhrase
                    key={g.eid}
                    group={g}
                    onClickGroup={() => onClickGroup(idx)}
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
            id="onCreateBtn"
            disabled={
              !(
                (accountName || accountNamePlaceholder) &&
                hdGroup[selectedGroupIdx]
              )
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
