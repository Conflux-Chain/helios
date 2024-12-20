import {useState, useEffect} from 'react'
import {runtime} from '@fluent-wallet/webextension'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import Modal from '@fluent-wallet/component-modal'
import {useTranslation} from 'react-i18next'
import {CopyButton, NetworkContent} from '../../components'
import useGlobalStore from '../../stores/index.js'
import {useQuery} from '../../hooks'
import {useDataForPopup, useNetworkTypeIsCfx} from '../../hooks/useApi'
import {RPC_METHODS} from '../../constants'
import {request, getPageType} from '../../utils'
import {WALLET_UNLOCK} from '../../constants/route'
const {CFX_GET_STATUS, ETH_GET_CHAIN_ID} = RPC_METHODS

const isDapp = getPageType() === 'notification'

function Error() {
  const {t} = useTranslation()
  const {FATAL_ERROR} = useGlobalStore()
  const {locked: isLocked} = useDataForPopup()
  const query = useQuery()
  const urlErrorMsg = query.get('errorMsg') ?? ''
  const isFromHome = query.get('from') === 'home'

  // type: route,fullNode,inner
  const [errorType, setErrorType] = useState('')
  const [zendeskTimer, setZendeskTimer] = useState(null)
  const [networkShow, setNetworkShow] = useState(false)
  const [resetButtonText, setResetButtonText] = useState('')

  const networkTypeIsCfx = useNetworkTypeIsCfx()

  useEffect(() => {
    if (!FATAL_ERROR && !urlErrorMsg) {
      return setErrorType('route')
    }

    request(networkTypeIsCfx ? CFX_GET_STATUS : ETH_GET_CHAIN_ID)
      .then(() => setErrorType('inner'))
      .catch(() => {
        request(CFX_GET_STATUS)
          .then(() => setErrorType('inner'))
          .catch(() => setErrorType('fullNode'))
      })
  }, [FATAL_ERROR, urlErrorMsg, networkTypeIsCfx])

  useEffect(() => {
    return () => {
      zendeskTimer && clearTimeout(zendeskTimer)
    }
  }, [zendeskTimer])

  useEffect(() => {
    if (errorType === '') {
      return
    }
    if (errorType === 'fullNode') {
      return setResetButtonText(t('retry'))
    }
    if (isDapp) {
      return setResetButtonText(t('close'))
    }
    if (isFromHome) {
      return setResetButtonText(t('reload'))
    }
    setResetButtonText(t('back'))
  }, [isFromHome, errorType, t])

  useEffect(() => {
    if (isLocked && location) {
      location.href = `${location.origin}${location.pathname}#${WALLET_UNLOCK}`
    }
  }, [isLocked])

  const onClickFeedback = () => {
    const timer = setTimeout(() => {
      zendeskTimer && clearTimeout(zendeskTimer)
      setZendeskTimer(null)
      window.open('https://fluent-wallet.zendesk.com/hc/en-001/requests/new')
    }, 900)
    setZendeskTimer(timer)
  }

  const onHandleError = () => {
    if (errorType === 'fullNode') {
      return runtime.reload()
    }

    if (isDapp) {
      return window?.close?.()
    }

    if (isFromHome) {
      return runtime.reload()
    }

    if (location?.hash !== '#/') {
      location.href = `${location.origin}${location.pathname}#/`
    }
    location?.reload()
  }

  return errorType ? (
    <div id="errorContainer" className="h-150 w-93 flex flex-col p-6 m-auto">
      <div className="flex-1 text-center">
        <CloseCircleFilled
          className={`text-error w-20 h-20 ${
            errorType === 'inner' ? 'mt-4' : 'mt-[108px]'
          } mb-6 mx-auto`}
        />
        <p className="text-base font-medium text-black mb-2">
          {t('errorTile')}
        </p>
        <p className="text-gray-60 text-sm">
          {errorType === 'route' ? t('routeError') : t('errorDes')}
        </p>
        {errorType == 'inner' ? (
          <div className="mt-6 text-left">
            <p className="font-medium text-gray-80 text-left text-sm mb-2">
              {t('errorCode')}
            </p>
            <div className="border border-gray-10 rounded bg-gray-4">
              <div className="px-3 pt-4 mb-6 max-h-45 overflow-y-auto no-scroll break-words">
                {FATAL_ERROR || urlErrorMsg}
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-6">
        {errorType == 'inner' ? (
          <CopyButton
            text={FATAL_ERROR || urlErrorMsg}
            toastClassName="left-2/4 transform -translate-x-2/4 -top-8"
            CopyInner={
              <div
                id="feedback"
                aria-hidden="true"
                className="text-center text-xs text-primary cursor-pointer"
                onClick={onClickFeedback}
              >
                {t('feedBackCode')}
              </div>
            }
          />
        ) : errorType == 'fullNode' ? (
          <div
            id="show-switch-network-modal"
            aria-hidden="true"
            onClick={() => setNetworkShow(true)}
            className="text-center text-xs text-primary cursor-pointer"
          >
            {t('switchNetwork')}
          </div>
        ) : null}
        <Button
          id="error-btn"
          className="w-70 mt-4 mx-auto"
          onClick={onHandleError}
        >
          {resetButtonText}
        </Button>
      </div>
      <Modal
        id="networkModal"
        open={networkShow}
        size="medium"
        title={t('chooseNetwork')}
        onClose={() => setNetworkShow(false)}
        content={
          <NetworkContent onClickNetworkItem={() => setNetworkShow(false)} />
        }
        className="bg-bg bg-gray-circles bg-no-repeat bg-contain max-h-[552px]"
      />
    </div>
  ) : null
}

export default Error
