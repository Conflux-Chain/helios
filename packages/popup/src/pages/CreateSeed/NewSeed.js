import {useTranslation} from 'react-i18next'
import create from 'zustand'
import Input from '@cfxjs/component-input'
import {CompWithLabel} from '../../components'

const usePageStore = create(set => ({
  groupName: '',
  setGroupName: groupName => set({groupName}),
}))

function NewSeed() {
  const {t} = useTranslation()
  const {groupName, setGroupName} = usePageStore()
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
