import {useState, useEffect} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Input from '@cfxjs/component-input'
import Button from '@cfxjs/component-button'
import {CompWithLabel} from '../../components'
import {useRPC} from '@cfxjs/use-rpc'
import useGlobalStore from '../../stores'

function NewSeed() {
  const {t} = useTranslation()
  const history = useHistory()
  const {setCreatedGroupName} = useGlobalStore()
  const [groupName, setGroupName] = useState('')
  const [groupNamePlaceholder, setGroupNamePlaceholder] = useState('')
  const {data: hdGroup} = useRPC(
    ['wallet_getAccountGroup', 'hd'],
    {type: 'hd'},
    {fallbackData: []},
  )
  useEffect(() => {
    setGroupNamePlaceholder(`Group-${hdGroup.length + 1}`)
  }, [hdGroup])

  return (
    <div className="h-full px-3 flex flex-col bg-bg justify-between">
      <div>
        <CompWithLabel label={t('seedGroupName')}>
          <Input
            width="w-full"
            maxLength="20"
            value={groupName}
            placeholder={groupNamePlaceholder}
            onChange={e => setGroupName(e.target.value)}
          />
        </CompWithLabel>
        <div className="mt-4 px-4 py-6 bg-gray-0 flex flex-col items-center">
          <img alt="bg" src="/images/create-seed-bg.svg" />
          <span className="text-gray-80 inline-block mt-3 mb-2">
            {t('seedCreateTitle')}
          </span>
          <span className="text-gray-40 text-xs">
            <Trans i18nKey="seedCreateContent" />
          </span>
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <Button
          className="w-70"
          onClick={() => {
            history.push('/create-account-backup-seed-phrase')
            setCreatedGroupName(groupName || groupNamePlaceholder)
          }}
          disabled={!(groupName || groupNamePlaceholder)}
        >
          {t('next')}
        </Button>
      </div>
    </div>
  )
}

export default NewSeed
