/* TODO: Replace with real error page */
import useGlobalStore from '../../stores/index.js'
import {useQuery} from '../../hooks'

function Error() {
  const {FATAL_ERROR} = useGlobalStore()
  const query = useQuery()
  const urlErrorMsg = query.get('errorMsg') ?? ''

  return (
    <div id="errorContainer" className="h-150 w-93 m-auto light">
      <h3>hoops.something goes wrong...</h3>
      <p>{FATAL_ERROR || urlErrorMsg}</p>
    </div>
  )
}

export default Error
