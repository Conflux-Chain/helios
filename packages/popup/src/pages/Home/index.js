import {useState, useCallback} from 'react'
import {ContactsOutlined} from '@fluent-wallet/component-icons'
// import {ENS} from '@fluent-wallet/did'
import {
  CFX_MAINNET_CHAINID,
  CFX_ESPACE_MAINNET_CHAINID,
  CFX_TESTNET_CHAINID,
  CFX_ESPACE_TESTNET_CHAINID,
} from '@fluent-wallet/consts'

import {useQuery} from '../../hooks'
import {useTxList, useCurrentAddress} from '../../hooks/useApi'
import {useEffectOnce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from '@fluent-wallet/component-button'
import {HomeNav} from '../../components'
import {PendingQueue} from './components'
import {ROUTES, MAX_PENDING_COUNT} from '../../constants'
import './index.css'
console.info('===========')
const {HISTORY, SEND_TRANSACTION, CONTACTS} = ROUTES
import {
  CurrentAccount,
  CurrentNetwork,
  CurrentDapp,
  HomeTokenList,
  AccountList,
  NetworkList,
  AddToken,
  Setting,
  CrossSpaceButton,
} from './components'
function Home() {
  const {t} = useTranslation()
  const [accountStatus, setAccountStatus] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(false)
  const [addTokenStatus, setAddTokenStatus] = useState(false)
  const [settingsStatus, setSettingStatus] = useState(false)
  const [accountsAnimate, setAccountsAnimate] = useState(true)
  const [settingAnimate, setSettingAnimate] = useState(true)

  const {
    data: {network},
  } = useCurrentAddress()
  const query = useQuery()
  const history = useHistory()
  const {data: pendingCount} = useTxList({
    params: {
      status: {gte: 0, lt: 4},
      countOnly: true,
    },
  })

  // useEffectOnce(() => {
  //   async function aGetName() {
  //     //   const cnsName=await CNS.getName('cfxtest:aak86utdktvnh3yta2kjvz62yae3kkcu1y9m9fgykn')
  //     //   console.info('cnsName',cnsName)
  //     const ensName = await ENS.getName(
  //       '0xA64F0db02B33C23F7215e1F562Eb3d8eee928917',
  //     )
  //     console.info('ensName', ensName)
  //   }
  //   aGetName()
  // })

  useEffectOnce(() => {
    const forward = query.get('open')
    if (forward === 'account-list') {
      history.replace('')
      setAccountsAnimate(false)
      setAccountStatus(true)
    } else if (forward === 'setting-page') {
      history.replace('')
      setSettingAnimate(false)
      setSettingStatus(true)
    }
  })
  const onCloseAccountList = () => {
    !accountsAnimate && setAccountsAnimate(true)
    setAccountStatus(false)
  }

  const onCloseSetting = () => {
    !settingAnimate && setSettingAnimate(true)
    setSettingStatus(false)
  }

  const onOpenAccount = useCallback(() => {
    setAccountStatus(true)
  }, [])

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
      <div className="flex flex-col pt-1 px-4 z-10 shrink-0">
        <div className="flex items-start justify-between">
          <CurrentAccount onOpenAccount={onOpenAccount} />
          <CurrentNetwork onOpenNetwork={() => setNetworkStatus(true)} />
        </div>
        <div className="flex mt-3 mb-4 justify-between">
          <div className="flex">
            <Button
              id="sendBtn"
              size="small"
              variant="outlined"
              className="!border-white !text-white !bg-transparent mr-2 hover:!bg-[#3C3A5D]"
              onClick={() => {
                history.push(SEND_TRANSACTION)
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
                  history.push(HISTORY)
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
            <Button
              id="go-contacts"
              size="small"
              variant="outlined"
              className="!border-white !text-white !bg-transparent ml-2 px-2 hover:!bg-[#3C3A5D]"
              onClick={() => {
                history.push(CONTACTS)
              }}
            >
              <ContactsOutlined />
            </Button>
          </div>
          {/* only conflux main and test network show cross space button */}
          {(network?.chainId === CFX_MAINNET_CHAINID ||
            network?.chainId === CFX_ESPACE_MAINNET_CHAINID) && (
            <CrossSpaceButton type="mainnet" />
          )}
          {(network?.chainId === CFX_TESTNET_CHAINID ||
            network?.chainId === CFX_ESPACE_TESTNET_CHAINID) && (
            <CrossSpaceButton type="testnet" />
          )}
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
      <Setting
        onClose={onCloseSetting}
        open={settingsStatus}
        settingAnimate={settingAnimate}
      />
    </div>
  )
}

export default Home
