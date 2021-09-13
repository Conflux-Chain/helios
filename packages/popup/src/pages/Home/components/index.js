import {HomeNav} from '../../../components'

function Home() {
  const onLock = () => {}
  return (
    <div className="flex flex-col">
      <HomeNav onLock={onLock} />
      <div className="flex flex-col h-50 pt-1 px-4">
        <div className="flex items-start justify-between"></div>
        <div className="flex mt-3 mb-4"></div>
      </div>
    </div>
  )
}

export default Home
