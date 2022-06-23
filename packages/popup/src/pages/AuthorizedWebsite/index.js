import {useTranslation} from 'react-i18next'
import {isUndefined} from '@fluent-wallet/checks'
import {TitleNav, NoResult, AccountGroupItem} from '../../components'
import {AuthorizedWebsiteAccountItem} from './components'
import {useGroupAccountAuthorizedDapps} from '../../hooks/useApi'
import {getAvatarAddress} from '../../utils'

const getAccountSiteId = groupData => {
  let ret = {}
  groupData.forEach(({account}) => {
    account.forEach(({app, eid}) => {
      if (app) {
        app.forEach(({site}) => {
          if (site) {
            if (ret[site.eid]) {
              ret[site.eid].push(eid)
            } else {
              ret[site.eid] = [eid]
            }
          }
        })
      }
    })
  })
  return ret
}

function AuthorizedWebsite() {
  const {t} = useTranslation()
  const {data} = useGroupAccountAuthorizedDapps()
  const groupData = (data || []).filter(({account}) =>
    account.some(({app}) => !!app),
  )
  const accountSiteId = getAccountSiteId(groupData)

  return (
    <div id="auth-web" className="bg-bg pb-8 h-full w-full flex flex-col">
      <TitleNav title={t('authorizedWebsite')} />
      <div className="flex-1 overflow-y-auto no-scroll px-3 mt-1">
        {!isUndefined(data) && groupData.length === 0 ? (
          <NoResult content={t('noAuthorizedWebsite')} />
        ) : (
          groupData.map(({nickname: groupNickname, account, vault}, index) => (
            <AccountGroupItem
              key={index}
              nickname={groupNickname}
              groupType={vault?.type}
              className="mx-0"
              showGroupNameIcon={false}
              groupContainerClassName="mb-0 ml-4 pb-1 pt-3"
            >
              {account
                .filter(({app}) => !!app)
                .map(
                  ({nickname: accountNickname, eid, app, address}, index) => (
                    <AuthorizedWebsiteAccountItem
                      key={index}
                      accountNickname={accountNickname}
                      accountId={eid}
                      address={getAvatarAddress(address)}
                      app={app}
                      accountSiteId={accountSiteId}
                    />
                  ),
                )}
            </AccountGroupItem>
          ))
        )}
      </div>
    </div>
  )
}

export default AuthorizedWebsite
