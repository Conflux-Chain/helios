import {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {Selected} from '@cfxjs/component-icons'
import {useStore} from '../../store'
import {CompWithLabel} from '../../components'

function SeedPhrase({accountGroup, onClick, selected = false}) {
  const {t} = useTranslation()
  const {nickname, account} = accountGroup
  return (
    <div
      role="menuitem"
      tabIndex="-1"
      className="h-12 px-3 hover:bg-primary-4 flex items-center cursor-pointer justify-between"
      onClick={() => onClick && onClick(accountGroup)}
      onKeyDown={() => {}}
    >
      <div className="flex items-center">
        <span className="text-gray-80 mr-2">{nickname}</span>
        <span className="text-gray-40">
          {account.length === 1
            ? t('oneAccount')
            : t('manyAccounts', {accountNum: account.length})}
        </span>
      </div>
      {selected && <Selected className="w-5 h-5" />}
    </div>
  )
}

SeedPhrase.propTypes = {
  accountGroup: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
}

function CurrentSeed() {
  const {t} = useTranslation()
  const [accountName, setAccountName] = useState('')
  const {group} = useStore()
  console.log('group', group)
  const accountGroups = group.groupHdData || []
  console.log('hd', accountGroups)
  const [selectedAccountGroupId, setSelectedAccountGroupId] = useState(null)

  const onSelectSeed = accountGroup => {
    setSelectedAccountGroupId(accountGroup.eid)
  }
  const onCreate = () => {}

  useEffect(() => {
    const selectedIndex = accountGroups.findIndex(
      accountGroup => accountGroup.eid === selectedAccountGroupId,
    )
    if (selectedIndex === -1) return
    const selectedAccountGroup = accountGroups[selectedIndex]
    const length = selectedAccountGroup.account.length
    setAccountName(`Create-${selectedIndex + 1}-${length + 1}`)
  }, [selectedAccountGroupId, accountGroups.length])

  useEffect(() => {
    if (accountGroups?.length > 0)
      setSelectedAccountGroupId(accountGroups[0].eid)
  }, [accountGroups.length])

  return (
    <div className="h-full px-3 flex flex-col bg-bg">
      <CompWithLabel label={t('accountName')}>
        <Input
          width="w-full"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
        />
      </CompWithLabel>
      <CompWithLabel
        label={t('selectSeedPhrase')}
        className="flex flex-1 flex-col mt-1 mb-3"
      >
        <div
          role="menu"
          className="flex flex-col flex-1 overflow-y-auto py-2 bg-gray-0 rounded-sm"
        >
          {accountGroups?.map((accountGroup, index) => (
            <SeedPhrase
              key={index}
              accountGroup={accountGroup}
              onClick={onSelectSeed}
              selected={selectedAccountGroupId === accountGroup.eid}
            />
          ))}
        </div>
      </CompWithLabel>
      <div className="flex justify-center mb-4">
        <Button
          className="w-70"
          onClick={onCreate}
          disabled={!accountName || !selectedAccountGroupId}
        >
          Create
        </Button>
      </div>
    </div>
  )
}

export default CurrentSeed
