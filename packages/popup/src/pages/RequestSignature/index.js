import {useTranslation} from 'react-i18next'
import {
  DappTransactionHeader,
  DappTransactionFooter,
  CompWithLabel,
} from '../../components'

function RequestSignature() {
  const {t} = useTranslation()

  return (
    <div
      id="requestSignatureContainer"
      className="flex flex-col h-full bg-blue-circles bg-no-repeat bg-bg"
    >
      <DappTransactionHeader
        title={t('signTypeMessage')}
        avatar={<img src="" alt="avatar" className="h-8 w-8" />}
        nickName="Mock Account"
        address="iammockaddressiammockaddressiammockaddress"
        rightContent={
          <div className="text-xs">
            <span className="text-gray-80">123</span>
            <span className="text-gray-60"> CFX</span>
          </div>
        }
      />
      <div className="flex-1 flex justify-between flex-col bg-gray-0 rounded-t-xl pb-4">
        <main className="rounded-t-xl pt-4 px-3 bg-gray-0">
          <div className="ml-1">
            <div className="text-sm text-gray-80 font-medium">
              {t('signThisMessage')}
            </div>
            <div className="text-xs text-gray-40 mt-1">Dai Stablecoin</div>
          </div>
          <CompWithLabel label={<p className="font-medium">{t('message')}</p>}>
            <div className="px-3 py-4 rounded bg-gray-4">
              <div className="text-xs text-gray-40">{t('holder')}</div>
              <div className="break-words text-gray-80 mt-0.5">
                0xE592427A0AEce92De3Edee1F18E0157C058615641231231231312
              </div>
              <div className="text-xs text-gray-40 mt-3">{t('spender')}</div>
              <div className="break-words text-gray-80 mt-0.5">
                0xE592427A0AEce92De3Edee1F18E0157C058615641231231231312
              </div>
            </div>
          </CompWithLabel>
          <div className="mt-3"></div>
        </main>
        <DappTransactionFooter
          cancelText={t('cancel')}
          confirmText={t('sign')}
        />
      </div>
    </div>
  )
}

export default RequestSignature
