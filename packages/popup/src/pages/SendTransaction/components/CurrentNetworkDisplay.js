import {useCurrentNetwork} from '../../../hooks/useApi'

function CurrentNetworkDisplay() {
  const currentNetwork = useCurrentNetwork()
  const {name, icon} = currentNetwork

  return (
    <div className="flex bg-primary rounded h-6 px-2 items-center">
      <img
        className="w-2.5 h-2.5 mr-1"
        src={icon || '/images/default-network-icon.svg'}
        alt="logo"
      />
      <span className="text-2xs text-white mr-1">{name}</span>
    </div>
  )
}

export default CurrentNetworkDisplay
