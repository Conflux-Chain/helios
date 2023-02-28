import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'
import {
  CheckCircleOutlined,
  CloseCircleFilled,
} from '@fluent-wallet/component-icons'
import {ANIMATE_DURING_TIME} from '../../../constants'

function AddressCheckedSymbol({checked, onClickCloseBtn, className = ''}) {
  const [showChecked, setShowChecked] = useState(false)
  const [showDeleteBtn, setShowDeleteBtn] = useState(false)

  useEffect(() => {
    let checkedTimer = null
    let deletedTimer = null
    if (checked) {
      setShowChecked(checked)
      checkedTimer = setTimeout(() => {
        setShowChecked(false)
        deletedTimer = setTimeout(() => {
          setShowDeleteBtn(true)
        }, ANIMATE_DURING_TIME)
      }, 1000)
    }

    return () => {
      clearTimeout(checkedTimer)
      clearTimeout(deletedTimer)
    }
  }, [checked])

  if (checked && !showDeleteBtn) {
    return (
      <CheckCircleOutlined
        className={`${className} ${
          showChecked
            ? 'animate-fade-in opacity-1'
            : 'animate-fade-out opacity-0'
        }`}
      />
    )
  }

  if ((checked && showDeleteBtn) || !checked) {
    return (
      <CloseCircleFilled
        className="text-gray-40 w-4 h-4 animate-fade-in opacity-1 cursor-pointer"
        onClick={() => onClickCloseBtn?.()}
      />
    )
  }
  return null
}

AddressCheckedSymbol.propTypes = {
  checked: PropTypes.bool,
  className: PropTypes.string,
  onClickCloseBtn: PropTypes.func,
}

export default AddressCheckedSymbol
