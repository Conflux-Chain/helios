import PropTypes from 'prop-types'
import {useState, useEffect, useCallback, useRef} from 'react'
import {useTranslation} from 'react-i18next'

import {useCurrentNetworkAddressMemo} from '../../../hooks/useApi'
import {ContactItem, ContactList, NoResult} from '../../../components'
import {PAGE_LIMIT} from '../../../constants'
import {setScrollPageLimit} from '../../../utils'

function Contact({
  fuzzy = '',
  showAddContact = false,
  setShowAddContact,
  onJumpToSendTx,
}) {
  const {t} = useTranslation()
  const contactListRef = useRef(null)

  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [total, setTotal] = useState(0)

  const [contactList, setContactList] = useState(undefined)

  const {data: memoData, mutate} = useCurrentNetworkAddressMemo({
    limit,
    fuzzy,
    g: {
      eid: 1,
      value: 1,
      gaddr: {
        value: 1,
      },
    },
  })

  const onAddedCallBack = async () => {
    await mutate()
    setShowAddContact?.(false)
  }
  const onScroll = useCallback(() => {
    setScrollPageLimit(
      contactListRef?.current,
      setLimit,
      contactList,
      total,
      limit,
    )
  }, [contactList, limit, total])

  useEffect(() => {
    if (memoData?.total !== total) {
      setTotal(memoData.total)
    }
    if (memoData?.data) {
      setContactList([...memoData.data])
    }
  }, [memoData, total])

  return (
    <div className="h-full w-full flex flex-col overflow-auto">
      {showAddContact && (
        <ContactItem
          onSubmitCallback={onAddedCallBack}
          onClickAwayCallback={() => setShowAddContact?.(false)}
        />
      )}
      <div
        className="flex-1 overflow-auto no-scroll"
        onScroll={onScroll}
        ref={contactListRef}
      >
        {contactList?.length > 0 && (
          <ContactList list={contactList} onClickContact={onJumpToSendTx} />
        )}
        {contactList?.length === 0 && <NoResult content={t('noResult')} />}
      </div>
    </div>
  )
}

Contact.propTypes = {
  fuzzy: PropTypes.string,
  showAddContact: PropTypes.bool,
  setShowAddContact: PropTypes.func,
  onJumpToSendTx: PropTypes.func,
}
export default Contact
