import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import {useState, useEffect} from 'react'
import Input from '@fluent-wallet/component-input'
import Checkbox from '@fluent-wallet/component-checkbox'
import {useRPC} from '@fluent-wallet/use-rpc'
import {
  CaretDownFilled,
  QuestionCircleOutlined,
} from '@fluent-wallet/component-icons'
import Modal from '@fluent-wallet/component-modal'
import {RPC_METHODS} from '../../constants'
import {NetworkContent} from '../../components'
import {useAccountGroupAddress} from '../../hooks'
const {GET_CURRENT_NETWORK} = RPC_METHODS

const getAddress = ({groupIndex, accountIndex, accountGroups, addressData}) => {
  if (groupIndex == 0) {
    return addressData[accountIndex]?.base32 || addressData[accountIndex]?.hex
  }
  return (
    addressData[accountGroups[groupIndex - 1].account.length + accountIndex - 1]
      ?.base32 ||
    addressData[accountGroups[groupIndex - 1].account.length + accountIndex - 1]
      ?.hex
  )
}
function ConnectSitesList({networkId}) {
  const {t} = useTranslation()
  const {accountGroups, addressData} = useAccountGroupAddress(networkId)
  console.log(accountGroups, addressData)
  return (
    <>
      <div>
        <div>{t('selectAuthorizedAccounts')}</div>
        <QuestionCircleOutlined onClick={() => window && window.open('')} />
        <Checkbox>{t('selectAll')}</Checkbox>
      </div>
      <div>
        {accountGroups.map(({nickname, account}, groupIndex) => (
          <div key={groupIndex}>
            <p className="text-gray-40 ml-4 mb-1 text-xs">{nickname}</p>
            {account.map(({nickname, eid}, accountIndex) => (
              <div
                aria-hidden="true"
                onClick={() => () => {}}
                key={accountIndex}
                className="flex p-3 rounded cursor-pointer"
              >
                {/* <img className="w-5 h-5 mr-2" src="" alt="avatar" /> */}
                <div className="flex-1">
                  <p className="text-xs text-gray-40">{nickname}</p>
                  <p>
                    {getAddress({
                      groupIndex,
                      accountIndex,
                      accountGroups,
                      addressData,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
ConnectSitesList.propTypes = {
  networkId: PropTypes.number,
}

function ConnectSite() {
  const [searchContent, setSearchContent] = useState('')
  const [networkShow, setNetworkShow] = useState(false)
  const [networkId, setNetworkId] = useState(null)
  const [searchIcon, setSearchIcon] = useState('')
  const {t} = useTranslation()
  const {data: currentNetworkData} = useRPC([GET_CURRENT_NETWORK])

  const onClickNetworkItem = ({networkId, networkName, icon}) => {
    setNetworkId(networkId)
    setSearchContent(networkName)
    setSearchIcon(icon || '')
    setNetworkShow(false)
  }

  useEffect(() => {
    setSearchIcon(currentNetworkData?.icon || '')
    setSearchContent(currentNetworkData?.name || '')
    setNetworkId(currentNetworkData?.eid || null)
  }, [Boolean(currentNetworkData)])

  return currentNetworkData ? (
    <>
      <header>
        <p>{t('connectSite')}</p>
        <div>
          <div />
          <div>
            <img src="" alt="favicon" />
          </div>
          <div />
          <img src="images/paperclip.svg" alt="connecting" />
          <div />
          <div>
            <img className="w-6 h-6" src="images/logo.svg" alt="logo" />
          </div>
          <div />
        </div>
        <p>dapp name</p>
      </header>
      <main>
        <p>{t('selectNetwork')}</p>
        <div
          aria-hidden
          onClick={() => setNetworkShow(true)}
          className="cursor-pointer"
        >
          <Input
            value={searchContent}
            width="w-full box-border"
            readOnly={true}
            className="pointer-events-none"
            suffix={<CaretDownFilled className="w-4 h-4 text-gray-40" />}
            prefix={
              <img
                src={searchIcon || 'images/default-network-icon.svg'}
                alt="network icon"
                className="w-4 h-4"
              />
            }
          />
        </div>
        <ConnectSitesList networkId={networkId} />
        <Modal
          open={networkShow}
          size="small"
          onClose={() => setNetworkShow(false)}
          content={<NetworkContent onClickNetworkItem={onClickNetworkItem} />}
        />
      </main>
      <footer></footer>
    </>
  ) : null
}

export default ConnectSite
