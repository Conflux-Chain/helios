import {useState} from 'react'
import {useDebounce} from 'react-use'

const useDebouncedValue = (val, deps, ms = 50) => {
  const [debouncedValue, setDebouncedValue] = useState(() => val)
  useDebounce(
    () => {
      setDebouncedValue(val)
    },
    ms,
    deps,
  )
  return debouncedValue
}

export default useDebouncedValue
