import {useState, useRef, useEffect} from 'react'
import {useDebounce} from 'react-use'
import {useHistory} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {EditOutlined} from '@fluent-wallet/component-icons'
import {isNumber} from '@fluent-wallet/checks'
import Message from '@fluent-wallet/component-message'

import {
  TitleNav,
  ContactItem,
  SearchInput,
  NoResult,
  CopyButton,
  WrapIcon,
} from '../../components'
import {PAGE_LIMIT, ROUTES, RPC_METHODS} from '../../constants'
import {useCurrentNetworkAddressMemo} from '../../hooks/useApi'
import {useCurrentTxStore} from '../../hooks'
import {request} from '../../utils'
import useLoading from '../../hooks/useLoading'
import DeleteContactModal from './components/DeleteContactModal'

const {SEND_TRANSACTION} = ROUTES
const {WALLET_DELETE_MEMO} = RPC_METHODS

function Contacts() {
  const {t} = useTranslation()
  const contactListRef = useRef(null)
  const history = useHistory()
  const {setToAddress} = useCurrentTxStore()
  const {setLoading} = useLoading()

  const [limit, setLimit] = useState(PAGE_LIMIT)
  const [total, setTotal] = useState(0)

  const [contactList, setContactList] = useState(undefined)

  const [editMemoId, setEditMemoId] = useState('')
  const [deleteMemoId, setDeleteMemoId] = useState('')
  const [mouseOverId, setMouseOverId] = useState('')

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

  const onClickSendButton = (address = '') => {
    setToAddress(address)
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
    <div id="contacts" className="h-full w-full  flex flex-col">
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
      <SearchInput value={searchContent} onChange={setSearchContent} />
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
        {contactList?.length > 0 &&
          contactList.map(({id, gaddr, value}) => (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => setMouseOverId(id)}
              onMouseLeave={() => setMouseOverId('')}
            >
              <ContactItem
                memoId={id}
                address={gaddr?.value}
                memo={value}
                editMemo={editMemoId === id}
                onSubmitCallback={onEditedCallBack}
                onClickAwayCallback={() => setEditMemoId('')}
                rightComponent={
                  id === mouseOverId && (
                    <div className="flex">
                      <WrapIcon
                        onClick={() => setEditMemoId(id)}
                        id="edit-memo"
                      >
                        <EditOutlined />
                      </WrapIcon>
                      <CopyButton
                        text={gaddr?.value || ''}
                        className="w-3 h-3 text-primary"
                        wrapperClassName="top-10 right-3"
                      />
                      <WrapIcon
                        onClick={() => onClickSendButton(gaddr?.value)}
                        id="send-tx"
                      >
                        <img src="/images/paper-plane.svg" alt="send" />
                      </WrapIcon>
                      <span
                        aria-hidden="true"
                        className="cursor-pointer"
                        id="delete"
                        onClick={() => setDeleteMemoId(id)}
                      >
                        {t('delete')}
                      </span>
                    </div>
                  )
                }
              />
            </div>
          ))}
        {contactList?.length === 0 && <NoResult content={t('noResult')} />}
      </div>
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
