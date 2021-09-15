/* TODO: Replace with real error page */
import useGlobalStore from '../../stores/index.js'

function Error() {
  const {FATAL_ERROR} = useGlobalStore()

  return (
    <div>
      <h3>hoops.something goes wrong...</h3>
      <p>{FATAL_ERROR}</p>
    </div>
  )
}

export default Error
