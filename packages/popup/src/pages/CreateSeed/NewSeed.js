import {useState, useEffect} from 'react'
import {useTranslation, Trans} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import Input from '@fluent-wallet/component-input'
import Button from '@fluent-wallet/component-button'
import {CompWithLabel, TitleNav} from '../../components'
import useGlobalStore from '../../stores'
import {ROUTES} from '../../constants'
import {useCreatedPasswordGuard} from '../../hooks'
import {useHdAccountGroup} from '../../hooks/useApi'

const {BACKUP_SEED_PHRASE} = ROUTES

function NewSeed() {
  useCreatedPasswordGuard()
  const {t} = useTranslation()
  const history = useHistory()
  const {setCreatedGroupName} = useGlobalStore()
  const [groupName, setGroupName] = useState('')
  const [groupNamePlaceholder, setGroupNamePlaceholder] = useState('')
  const hdGroup = useHdAccountGroup()
  useEffect(() => {
    setGroupNamePlaceholder(`Seed-${hdGroup.length + 1}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hdGroup])

  return (
    <div className="flex flex-col h-full w-full bg-bg" id="newSeedContainer">
      <TitleNav title={t('newAccount')} />
      <main className="px-3 flex flex-1 flex-col justify-between">
        <div>
          <CompWithLabel label={t('seedGroupName')}>
            <Input
              width="w-full"
              maxLength="20"
              value={groupName}
              placeholder={groupNamePlaceholder}
              onChange={e => setGroupName(e.target.value)}
              id="newSeedInput"
            />
          </CompWithLabel>
          <div
            className="mt-4 px-4 py-6 bg-gray-0 flex flex-col items-center"
            id="newSeedContent"
          >
            <img alt="bg" src="/images/create-seed-bg.svg" />
            <span className="text-gray-80 inline-block mt-3 mb-2">
              {t('seedCreateTitle')}
            </span>
            <span className="text-gray-40 text-xs">
              <Trans i18nKey="seedCreateContent" />
            </span>
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <Button
            className="w-70"
            id="newSeedBtn"
            onClick={() => {
              history.push(BACKUP_SEED_PHRASE)
              setCreatedGroupName(groupName || groupNamePlaceholder)
            }}
            disabled={!(groupName || groupNamePlaceholder)}
          >
            {t('next')}
          </Button>
        </div>
      </main>
    </div>
  )
}

export default NewSeed
