import PropTypes from 'prop-types'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {Selected} from '@cfxjs/component-icons'
import {CompWithLabel} from '../../components'
import create from '../../hooks/zustand'

const useStore = create(
  (set, get) => ({
    // value
    hdGroup: [],
    creatingAccount: false,
    accountCreationError: null,
    accountName: '',
    selectedGroup: null,

    // hook
    groupAfterSet: ({groupData}) => {
      const hdGroup = groupData.filter(g => g?.vault?.type === 'hd')
      set({hdGroup})
      if (!get().selectedGroup) set({selectedGroup: hdGroup[0]})
      if (!get().accountName && hdGroup[0]) {
        set({
          accountName: `Account-1-${hdGroup[0].account.length + 1}`,
        })
      }
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
        if (error) return set({accountCreationError: error.message})
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
    setSelectedGroup: (selectedGroup, index) => {
      set({selectedGroup})
      set({
        accountName: `Account-${index + 1}-${selectedGroup.account.length + 1}`,
      })
    },
  }),
  {
    group: {
      deps: 'wallet_getAccountGroup',
      opts: {fallbackData: []},
    },
  },
)

function SeedPhrase({group, idx}) {
  const {getGroupInfo, setSelectedGroup, selectedGroup} = useStore()
  const {nickname, accountLength} = getGroupInfo(group)

  return (
    <div
      role="menuitem"
      tabIndex="-1"
      key={group.eid}
      className="h-12 px-3 hover:bg-primary-4 flex items-center cursor-pointer justify-between"
      onClick={() => setSelectedGroup(group, idx)}
      onKeyDown={() => {}}
    >
      <div className="flex items-center">
        <span className="text-gray-80 mr-2">{nickname}</span>
        <span className="text-gray-40">{accountLength}</span>
      </div>
      {group.eid === selectedGroup?.eid && <Selected className="w-5 h-5" />}
    </div>
  )
}

SeedPhrase.propTypes = {
  group: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
}

function CurrentSeed() {
  const {
    t,
    accountName,
    setAccountName,
    selectedGroup,
    hdGroup,
    accountNameError,
    onCreate,
  } = useStore()

  return (
    <div className="h-full px-3 flex flex-col bg-bg">
      <CompWithLabel label={t('accountName')}>
        <Input
          width="w-full"
          value={accountName}
          maxLength="20"
          onChange={e => setAccountName(e.target.value)}
          errorMessage={accountNameError}
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
          {hdGroup.map(
            (g, idx) => g && <SeedPhrase key={g.eid} group={g} idx={idx} />,
          )}
        </div>
      </CompWithLabel>
      <div className="flex justify-center mb-4">
        <Button
          className="w-70"
          onClick={onCreate}
          disabled={!(accountName && selectedGroup && !accountNameError)}
        >
          {t('create')}
        </Button>
      </div>
    </div>
  )
}

export default CurrentSeed
