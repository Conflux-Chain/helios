import {useState} from 'react'
import PropTypes from 'prop-types'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {EyeClose} from '@cfxjs/component-icons'
import {useGlobalState} from '../../stores/useGlobalStore'

function SeedPhrase({accountGroup, onClick, ...otherProps}) {
  const [selected, setSelected] = useState(false)
  const {nickname, account} = accountGroup
  const onClickHandle = () => {
    setSelected(true)
    onClick && onClick(accountGroup)
  }
  return (
    <div
      role="button"
      tabIndex={0}
      {...otherProps}
      className="w-full h-12 px-3 hover:bg-primary-4 flex items-center cursor:pointer justify-between"
      onClick={onClickHandle}
      onKeyDown={() => {}}
    >
      <div className="flex items-center">
        <span className="text-gray-80 mr-2">{nickname}</span>
        <span className="text-gray-40">{`${account.length} ${
          account.length <= 1 ? 'account' : 'accounts'
        }`}</span>
      </div>
      {selected && <EyeClose className="w-5 h-5" />}
    </div>
  )
}

SeedPhrase.propTypes = {
  accountGroup: PropTypes.object.isRequired,
  onClick: PropTypes.func,
}

function CurrentSeed() {
  const [selectedAccountGroup, setSelectedAccountGroup] = useState(null)
  const {accountGroups} = useGlobalState()
  const onSelectSeed = accountGroup => {
    setSelectedAccountGroup(accountGroup)
    console.log(selectedAccountGroup)
  }
  return (
    <div className="w-full h-full px-4 pb-4 flex flex-col bg-bg items-center">
      <div className="w-full">
        <span className="text-gray-80 my-3 inline-block">Account Name</span>
        <Input width="w-full" />
      </div>
      <div className="mt-6 mb-4 flex flex-1 flex-col w-full">
        <span className="text-gray-80 mb-3 inline">Select Seed Phrase</span>
        <div className="flex flex-1 overflow-y-auto py-2 bg-gray-0 rounded-sm">
          {accountGroups?.map((accountGroup, index) => (
            <SeedPhrase
              key={index}
              accountGroup={accountGroup}
              onClick={onSelectSeed}
            />
          ))}
          <SeedPhrase
            key={0}
            accountGroup={{nickname: 'Seed1', account: ['test']}}
            onClick={onSelectSeed}
          />
        </div>
      </div>
      <Button className="w-70">Create</Button>
    </div>
  )
}

export default CurrentSeed
