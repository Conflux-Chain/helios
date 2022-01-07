import {useState} from 'react'
import {useQuery} from '../../hooks'
import {useTxList} from '../../hooks/useApi'

import {useEffectOnce} from 'react-use'
import {useNavigate} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {HomeNav} from '../../components'
import {PendingQueue} from './components'
import {ROUTES, MAX_PENDING_COUNT} from '../../constants'
import './index.css'

const {HISTORY} = ROUTES
import {
  CurrentAccount,
  CurrentNetwork,
  CurrentDapp,
  HomeTokenList,
  AccountList,
  NetworkList,
  AddToken,
  Setting,
} from './components'
function Home() {
  const {t} = useTranslation()
  const [accountStatus, setAccountStatus] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(false)
  const [addTokenStatus, setAddTokenStatus] = useState(false)
  const [settingsStatus, setSettingStatus] = useState(false)
  const [accountsAnimate, setAccountsAnimate] = useState(true)
  const query = useQuery()
  const navigate = useNavigate()
  const pendingCount = useTxList({status: {gte: 0, lt: 4}, countOnly: true})

  useEffectOnce(() => {
    if (query.get('open') === 'account-list') {
      navigate('', true)
      setAccountsAnimate(false)
      setAccountStatus(true)
    }
  })
  const onCloseAccountList = () => {
    !accountsAnimate && setAccountsAnimate(true)
    setAccountStatus(false)
  }

  return (
    <div
      className="home-container flex flex-col bg-bg h-full w-full relative overflow-hidden"
      id="homeContainer"
    >
      {/* only for dev env*/}
      {import.meta.env.NODE_ENV === 'development' ? (
        <button onClick={() => open(location.href)} className="z-10 text-white">
          open
        </button>
      ) : null}
      <HomeNav
        onClickMenu={() => {
          setSettingStatus(true)
        }}
      />
      <div className="flex flex-col pt-1 px-4 z-10 flex-shrink-0">
        <div className="flex items-start justify-between">
          <CurrentAccount onOpenAccount={() => setAccountStatus(true)} />
          <CurrentNetwork onOpenNetwork={() => setNetworkStatus(true)} />
        </div>
        <div className="flex mt-3 mb-4">
          <Button
            id="sendBtn"
            size="small"
            variant="outlined"
            className="!border-white !text-white !bg-transparent mr-2 hover:!bg-[#3C3A5D]"
            onClick={() => {
              navigate('/send-transaction')
            }}
          >
            {t('send')}
          </Button>
          <div className="relative">
            <Button
              id="historyBtn"
              size="small"
              variant="outlined"
              className="!border-white !text-white !bg-transparent hover:!bg-[#3C3A5D]"
              onClick={() => {
                navigate(HISTORY)
              }}
            >
              {t('history')}
            </Button>
            {pendingCount ? (
              <PendingQueue
                count={`${
                  pendingCount > MAX_PENDING_COUNT
                    ? MAX_PENDING_COUNT + '+'
                    : pendingCount
                } `}
              />
            ) : null}
          </div>
        </div>
      </div>
      <HomeTokenList onOpenAddToken={() => setAddTokenStatus(true)} />
      <CurrentDapp />
      <AccountList
        onClose={onCloseAccountList}
        open={accountStatus}
        accountsAnimate={accountsAnimate}
      />
      <NetworkList
        onClose={() => setNetworkStatus(false)}
        open={networkStatus}
      />
      <AddToken
        onClose={() => setAddTokenStatus(false)}
        open={addTokenStatus}
      />
      <Setting onClose={() => setSettingStatus(false)} open={settingsStatus} />
    </div>
  )
}

export default Home
