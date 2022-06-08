import {useState, useRef} from 'react'

import {EditOutlined} from '@fluent-wallet/component-icons'
import {TextField} from './'

function TextFieldWithEditIcon({...props}) {
  const [showInputStatus, setShowInputStatus] = useState(false)
  const [showEditIconStatus, setShowEditIconStatus] = useState(false)

  const ref = useRef(null)

  const onClickEditBtn = () => {
    setShowInputStatus(true)
    setTimeout(() => {
      ref?.current?.focus?.()
    })
  }

  return (
    <TextField
      ref={ref}
      showInputStatus={showInputStatus}
      setShowInputStatus={setShowInputStatus}
      onMouseEnter={() => setShowEditIconStatus(true)}
      onMouseLeave={() => setShowEditIconStatus(false)}
      {...props}
      rightComponent={
        <div className="ml-2 w-4 h-4">
          {showEditIconStatus && !showInputStatus && (
            <EditOutlined
              className={
                'w-4 h-4 cursor-pointer text-gray-60 hover:text-primary pointer-events-none'
              }
              id="edit-text-value"
              onClick={onClickEditBtn}
            />
          )}
        </div>
      }
    />
  )
}

export default TextFieldWithEditIcon
