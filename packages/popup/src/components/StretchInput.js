import PropTypes from 'prop-types'
import {useState, useLayoutEffect, useEffect, useRef} from 'react'
import Input from '@fluent-wallet/component-input'
import {SearchAccount} from './'

function StretchInput({
  currentNetworkId,
  setSearchedAccountGroup,
  expandWidth,
  shrinkWidth,
  rightNode,
  leftNode,
  wrapperClassName = '',
  inputClassName = '',
  ...props
}) {
  const invisibleInputRef = useRef({})
  const visibleInputRef = useRef(null)
  const [invisibleInputValue, setInvisibleInputValue] = useState('')
  const [visibleInputValue, setVisibleInputValue] = useState('')
  const [spreadInputStatus, setSpreadInputStatus] = useState(false)
  const [visibleInputFocused, setVisibleInputFocused] = useState(false)
  const [inVisibleInputFocused, setInVisibleInputFocused] = useState(false)

  const spreadInput = () => {
    if (!visibleInputValue) {
      setSpreadInputStatus(false)
    }
  }
  const onVisibleInputChange = value => {
    setVisibleInputValue(value)
  }

  const onVisibleInputFocus = () => {
    setInvisibleInputValue('')
    setVisibleInputFocused(true)
    setSpreadInputStatus(true)
  }

  const onVisibleInputBlur = () => {
    spreadInput()
    setVisibleInputFocused(false)
  }

  const onInVisibleInputFocus = () => {
    setInVisibleInputFocused(true)
  }
  const onInVisibleInputBlur = () => {
    setInVisibleInputFocused(false)
  }

  useLayoutEffect(() => {
    const onHiddenInputRefFocus = () => {
      if (visibleInputFocused || inVisibleInputFocused || visibleInputValue) {
        return
      }
      invisibleInputRef.current.focus()
    }
    document.addEventListener('keydown', onHiddenInputRefFocus)
    return () => {
      document.removeEventListener('keydown', onHiddenInputRefFocus)
    }
  }, [inVisibleInputFocused, visibleInputFocused, visibleInputValue])

  useEffect(() => {
    if (invisibleInputValue) {
      setVisibleInputValue(invisibleInputValue)
      visibleInputRef.current.focus()
    }
  }, [invisibleInputValue])

  return (
    <>
      <Input
        value={invisibleInputValue}
        onChange={e => setInvisibleInputValue(e.target.value)}
        ref={invisibleInputRef}
        onFocus={onInVisibleInputFocus}
        onBlur={onInVisibleInputBlur}
        containerClassName="!h-0 w-0 border-0"
        className="w-0 !h-0"
      />
      <div className={`flex items-center ${wrapperClassName}`}>
        {leftNode}
        <div
          className={`${
            spreadInputStatus ? expandWidth : shrinkWidth
          } transition-all`}
        />
        <div className="flex-1 mr-3">
          <SearchAccount
            currentNetworkId={currentNetworkId}
            onSearch={onVisibleInputChange}
            searchContent={visibleInputValue}
            onSearchCallback={setSearchedAccountGroup}
            containerClassName={`!h-6 !border-transparent !rounded-full ${inputClassName}`}
            size="small"
            prefixClassName="w-3 h-3 text-gray-40"
            suffixClassName="w-3 h-3 text-gray-40 cursor-pointer"
            prefixContainerClassName="!pl-[6px] !mr-0"
            suffixContainerClassName="!ml-0 pr-[6px]"
            className="!pl-1 !pr-0"
            onFocus={onVisibleInputFocus}
            onBlur={onVisibleInputBlur}
            onClickAway={spreadInput}
            ref={visibleInputRef}
            {...props}
          />
        </div>
        {rightNode}
      </div>
    </>
  )
}
StretchInput.propTypes = {
  currentNetworkId: PropTypes.number.isRequired,
  setSearchedAccountGroup: PropTypes.func.isRequired,
  shrinkWidth: PropTypes.string.isRequired,
  expandWidth: PropTypes.string.isRequired,
  rightNode: PropTypes.node,
  leftNode: PropTypes.node,
  wrapperClassName: PropTypes.string,
  inputClassName: PropTypes.string,
}

export default StretchInput
