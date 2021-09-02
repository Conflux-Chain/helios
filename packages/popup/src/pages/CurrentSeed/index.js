import PropTypes from 'prop-types'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {Selected} from '@cfxjs/component-icons'
import {CompWithLabel} from '../../components'
import create from '../../hooks/zustand.js'

const useStore = create(
  (set, get) => ({
    // value
    hdGroup: [],
    creatingAccount: false,
    accountCreatationError: null,
    accountName: '',
    selectedGroup: null,
    // hook
    groupAfterSet: ({groupData}) => {
      set({hdGroup: groupData.filter(({vault: {type}}) => type === 'hd')})
      if (!get().selectedGroup) set({selectedGroup: get().group.groupData[0]})
    },

    // logic
    setAccountName: accountName => set({accountName}),
    onCreate: () => {
      const {
        r,
        selectedGroup: {eid},
        accountName,
        group: {groupMutate},
      } = get()
      set({creatingAccount: true})
      return r({
        method: 'wallet_createAccount',
        params: {accountGroupId: eid, nickname: accountName},
      }).then(({error}) => {
        set({creatingAccount: false})
        if (error) return set({accountCreatationError: error.message})
        groupMutate()
        // jump to next page?
      })
    },
    getGroupInfo({account: {length}, nickname}) {
      const {t} = get()
      return {
        nickname,
        accountLength:
          length === 1
            ? t('oneAccount')
            : t('manyAccounts', {accountNum: length}),
      }
    },
    setSelectedGroup: selectedGroup => set({selectedGroup}),
  }),
  {
    group: {
      deps: 'wallet_getAccountGroup',
      opts: {fallbackData: []},
    },
  },
)

function SeedPhrase({group}) {
  const {getGroupInfo, setSelectedGroup, selectedGroup} = useStore()
  const {nickname, accountLength} = getGroupInfo(group)

  return (
    <div
      role="menuitem"
      tabIndex="-1"
      key={group.eid}
      className="h-12 px-3 hover:bg-primary-4 flex items-center cursor-pointer justify-between"
      onClick={() => setSelectedGroup(group)}
      onKeyDown={() => {}}
    >
      <div className="flex items-center">
        <span className="text-gray-80 mr-2">{nickname}</span>
        <span className="text-gray-40">{accountLength}</span>
      </div>
      {group.eid === selectedGroup.eid && <Selected className="w-5 h-5" />}
    </div>
  )
}

SeedPhrase.propTypes = {
  group: PropTypes.object.isRequired,
}

function CurrentSeed() {
  const {t, accountName, setAccountName, selectedGroup, hdGroup, onCreate} =
    useStore()

  return (
    <div className="w-full h-full px-4 pb-4 flex flex-col bg-bg items-center">
      <CompWithLabel label={t('accountName')}>
        <Input
          width="w-full"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
        />
      </CompWithLabel>
      <div className="mt-6 mb-4 flex flex-1 flex-col w-full">
        <span className="text-gray-80 mb-3 inline">
          {t('selectSeedPhrase')}
        </span>
        <div
          role="menu"
          className="flex flex-col flex-1 overflow-y-auto py-2 bg-gray-0 rounded-sm"
        >
          {hdGroup.map(g => g && <SeedPhrase key={g.eid} group={g} />)}
        </div>
      </div>
      <Button
        className="w-70"
        onClick={onCreate}
        disabled={!(accountName && selectedGroup)}
      >
        Create
      </Button>
    </div>
  )
}

export default CurrentSeed
