import {useState, useEffect} from 'react'
import {useHistory} from 'react-router-dom'
import {CloseCircleFilled} from '@fluent-wallet/component-icons'
import Button from '@fluent-wallet/component-button'
import {useTranslation} from 'react-i18next'
import useGlobalStore from '../../stores/index.js'
import {useQuery} from '../../hooks'
import {RPC_METHODS, ROUTES} from '../../constants'
import {request} from '../../utils'
const {CFX_GET_STATUS} = RPC_METHODS
const {HOME} = ROUTES

function Error() {
  const {t} = useTranslation()
  const history = useHistory()
  const {FATAL_ERROR} = useGlobalStore()
  const query = useQuery()
  const urlErrorMsg = query.get('errorMsg') ?? ''
  // type: route,fullNode,inner
  const [errorType, setErrorType] = useState('route')

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

  return errorType ? (
    <div id="errorContainer" className="h-full w-full flex flex-col p-6">
      <div className="flex-1 text-center">
        <CloseCircleFilled className="text-error w-20 h-20 mt-[108px] mb-6 mx-auto" />
        <p className="text-base font-medium text-black mb-2">
          {t('errorTile')}
        </p>
        <p className="text-gray-60 text-sm">{t('routeError')}</p>
      </div>

      {/* <p>{FATAL_ERROR || urlErrorMsg}</p> */}
      <div>
        <Button
          id="setPasswordFormBtn"
          className="w-70 mt-4 mx-auto"
          onClick={() => history.push(HOME)}
        >
          {t('back')}
        </Button>
      </div>
    </div>
  ) : null
}

export default Error
