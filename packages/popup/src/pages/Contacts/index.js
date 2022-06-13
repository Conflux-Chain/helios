import {useState, useRef, useEffect} from 'react'
import {useDebounce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {isNumber} from '@fluent-wallet/checks'
import Message from '@fluent-wallet/component-message'

import {
  TitleNav,
  ContactItem,
  ContactList,
  SearchInput,
  NoResult,
} from '../../components'
import {PAGE_LIMIT, ROUTES, RPC_METHODS} from '../../constants'
import {useCurrentNetworkAddressMemo} from '../../hooks/useApi'
import {useCurrentTxStore} from '../../hooks'
import useGlobalStore from '../../stores'
import {request} from '../../utils'
import useLoading from '../../hooks/useLoading'
import {DeleteContactModal, ContactOperationComponent} from './components'

const {SEND_TRANSACTION} = ROUTES
const {WALLET_DELETE_MEMO} = RPC_METHODS

function Contacts() {
  const {t} = useTranslation()
  const contactListRef = useRef(null)
  const history = useHistory()
  const {setToAddress} = useCurrentTxStore()
  const {setLoading} = useLoading()
  const {setAddressNote} = useGlobalStore()

  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [total, setTotal] = useState(0)

  const [contactList, setContactList] = useState(undefined)

  const [editMemoId, setEditMemoId] = useState('')
  const [deleteMemoId, setDeleteMemoId] = useState('')
  const [mouseOverItem, setMouseOverAddressItem] = useState({})

  const [showAddContact, setShowAddContact] = useState(false)

  const [searchContent, setSearchContent] = useState('')
  const [debouncedSearchContent, setDebouncedSearchContent] =
    useState(searchContent)

  const {data: memoData, mutate} = useCurrentNetworkAddressMemo({
    limit,
    fuzzy: debouncedSearchContent,
    g: {
      eid: 1,
      value: 1,
      gaddr: {
        value: 1,
      },
    },
  })

  useDebounce(
    () => {
      setDebouncedSearchContent(searchContent)
    },
    200,
    [searchContent],
  )
  useEffect(() => {
    if (memoData?.total !== total) {
      setTotal(memoData.total)
    }
    if (memoData?.data) {
      setContactList([...memoData.data])
    }
  }, [memoData, total])

  const onScroll = () => {
    if (
      contactListRef.current.scrollHeight -
        contactListRef.current.clientHeight <=
        contactListRef.current.scrollTop &&
      contactList?.length < total &&
      limit < total
    ) {
      setLimit(limit + PAGE_LIMIT)
    }
  }

  const onMouseOver = item => {
    setMouseOverAddressItem({...item})
  }

  const onAddedCallBack = () => {
    setShowAddContact(false)
    setLimit(PAGE_LIMIT)
    setTotal(0)
    setSearchContent('')
    !debouncedSearchContent && mutate()
  }

  const onEditedCallBack = async () => {
    await mutate()
    setEditMemoId('')
  }

  const onClickSend = ({address = '', note = ''}) => {
    setToAddress(address)
    address && note && setAddressNote({[address]: note})
    history.push(SEND_TRANSACTION)
  }

  const onDeleteContact = async () => {
    setLoading(true)
    try {
      await request(WALLET_DELETE_MEMO, {memoId: deleteMemoId})
      await mutate()
      setLoading(false)
      setDeleteMemoId('')
    } catch (e) {
      setLoading(false)
      Message.error({
        content: e?.message ?? t('unCaughtErrMsg'),
        top: '10px',
        duration: 1,
      })
    }
  }

  return (
    <div id="contacts" className="h-full w-full flex flex-col bg-bg px-3">
      <TitleNav
        title={t('contacts')}
        rightButton={
          <span
            onClick={() => setShowAddContact(true)}
            aria-hidden="true"
            id="add-contact"
          >
            {t('add')}
          </span>
        }
      />
      <SearchInput
        value={searchContent}
        onChange={setSearchContent}
        containerClassName="mt-1"
      />
      {showAddContact && (
        <ContactItem
          onSubmitCallback={onAddedCallBack}
          onClickAwayCallback={() => setShowAddContact(false)}
        />
      )}
      <div
        className="flex-1 overflow-auto no-scroll"
        onScroll={onScroll}
        ref={contactListRef}
      >
        {contactList?.length > 0 && (
          <ContactList
            onMouseOver={onMouseOver}
            contactSubmitCallback={onEditedCallBack}
            contactClickAwayCallback={() => setEditMemoId('')}
            editMemoId={editMemoId}
            hoverContactId={mouseOverItem?.memoId}
            list={contactList}
            contactRightComponent={
              <ContactOperationComponent
                mouseOverItem={mouseOverItem}
                onClickEdit={setEditMemoId}
                onClickSend={onClickSend}
                onClickDelete={setDeleteMemoId}
              />
            }
          />
        )}
      </div>
      {contactList?.length === 0 && <NoResult content={t('noResult')} />}
      <DeleteContactModal
        open={isNumber(deleteMemoId)}
        onClose={() => setDeleteMemoId('')}
        deleteMemoId={deleteMemoId}
        onDelete={onDeleteContact}
      />
    </div>
  )
}

export default Contacts
