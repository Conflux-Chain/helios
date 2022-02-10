import React, {useCallback} from 'react'
import {connect} from '../../manage/useFluent'
import showToast from '../../components/tools/Toast'

const Connect: React.FC = () => {
  const handleClickConnect = useCallback(async () => {
    try {
      await connect()
      showToast('Connect to Fluent Success!')
    } catch (err) {
      console.error(err)
      if ((err as any)?.code === -32000) {
        showToast('You have opened the connection window', {key: 'have-opened'})
      }
      if ((err as any)?.message === 'not installed') {
        showToast("You doesn't have Fluent installed", {key: 'not-installed'})
      }
    }
  }, [])

  return (
    <button
      id="btn-connect"
      className="button text-[16px] w-[432px] h-[48px] mt-[48px]"
      onClick={handleClickConnect}
    >
      Connect Fluent Wallet
    </button>
  )
}

export default Connect
