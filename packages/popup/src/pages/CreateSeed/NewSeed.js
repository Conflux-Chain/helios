import create from '../../hooks/zustand'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'

const useStore = create(
  set => ({
    // value
    groupName: '',

    // logic
    setGroupName: groupName => set({groupName}),
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
          maxLength="20"
          value={groupName}
          onChange={e => setGroupName(e.target.value)}
        />
      </CompWithLabel>
      <div></div>
    </div>
  )
}

export default NewSeed
