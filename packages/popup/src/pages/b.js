import {useStore} from '../zustlandDemo'
function BearCounter() {
  const bears = useStore(state => state.bears)
  return <h1>{bears} around here ...</h1>
}

function Controls() {
  const increasePopulation = useStore(state => state.increasePopulation)
  return <button onClick={increasePopulation}>one up</button>
}
const b = () => {
  return (
    <div>
      <BearCounter />
      <Controls />
    </div>
  )
}

export default b
