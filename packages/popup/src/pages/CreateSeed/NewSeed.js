import create from '../../hooks/zustand.js'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'

const useStore = create(
  (set, get) => ({
    // value
    groupNameError: null,
    groupName: '',

    // logic
    setGroupName: groupName => {
      set({groupName})
      const noDup = get().group.groupData.reduce(
        (noDup, {nickname}) => noDup && nickname !== groupName,
        true,
      )
      if (noDup) set({groupNameError: null})
      else set({groupNameError: get().t('errorDuplicateName')})
    },
    setGroupNameError: groupNameError => set({groupNameError}),
  }),
  {
    group: {
      deps: 'wallet_getAccountGroup',
      opts: {fallbackData: []},
    },
  },
)

function NewSeed() {
  const {groupName, setGroupName, t} = useStore()
  return (
    <div className="h-full px-3 flex flex-col bg-bg">
      <CompWithLabel label={t('seedGroupName')}>
        <Input
          width="w-full"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
      </CompWithLabel>
      <div></div>
    </div>
  )
}

export default NewSeed
