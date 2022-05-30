import {useTranslation} from 'react-i18next'
import {TitleNav, ContactItem} from '../../components'

function Contacts() {
  const {t} = useTranslation()

  return (
    <div id="contacts" className="h-full w-full  flex flex-col">
      <TitleNav title={t('contacts')} rightButton={<span>{t('add')}</span>} />
      <ContactItem />
    </div>
  )
}

export default Contacts
