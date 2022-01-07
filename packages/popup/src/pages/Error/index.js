import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {runtime} from '@fluent-wallet/webextension'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import Modal from '@fluent-wallet/component-modal'
import {useTranslation} from 'react-i18next'
import {CopyButton, NetworkContent} from '../../components'
import useGlobalStore from '../../stores/index.js'
import {useQuery} from '../../hooks'
import {RPC_METHODS, ROUTES} from '../../constants'
import {request} from '../../utils'
const {CFX_GET_STATUS} = RPC_METHODS
const {HOME} = ROUTES

function Error() {
  const {t} = useTranslation()
  const navigate = useNavigate()
  const {FATAL_ERROR} = useGlobalStore()
  const query = useQuery()
  const urlErrorMsg = query.get('errorMsg') ?? ''
  // type: route,fullNode,inner
  const [errorType, setErrorType] = useState('')
  const [zendeskTimer, setZendeskTimer] = useState(null)
  const [networkShow, setNetworkShow] = useState(false)
  useEffect(() => {
    if (!FATAL_ERROR && !urlErrorMsg) {
      return setErrorType('route')
    }

    request(CFX_GET_STATUS)
      .then(() => setErrorType('inner'))
      .catch(() => {
        request(CFX_GET_STATUS)
          .then(() => setErrorType('inner'))
          .catch(() => setErrorType('fullNode'))
      })
  }, [FATAL_ERROR, urlErrorMsg])

  useEffect(() => {
    return () => {
      zendeskTimer && clearTimeout(zendeskTimer)
    }
  }, [zendeskTimer])

  // TODO: need put zendesk link together with error message
  const onClickFeedback = () => {
    const timer = setTimeout(() => {
      zendeskTimer && clearTimeout(zendeskTimer)
      setZendeskTimer(null)
      window.open('https://fluent-wallet.zendesk.com/hc/en-001/requests/new')
    }, 900)
    setZendeskTimer(timer)
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
          onClick={() =>
            errorType === 'fullNode' ? runtime.reload() : navigate(HOME)
          }
        >
          {errorType === 'fullNode' ? t('retry') : t('back')}
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
        className="bg-bg bg-gray-circles bg-no-repeat bg-contain"
      />
    </div>
  ) : null
}

export default Error
