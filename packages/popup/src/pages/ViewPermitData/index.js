import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import TitleNav from '../../components/TitleNav'
import {usePermitType} from '../../hooks/useSignatureRequest'
import {formatIntoChecksumAddress} from '../../utils'
import {useValid20Token} from '../../hooks/useApi'
import {useEffect} from 'react'
import {REQUEST_SIGNATURE} from '../../constants/route'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import dayjs from 'dayjs'
import PermitTokenInfo from '../../components/PermitTokenInfo'
import {EndsWithArrayReg, formatPermitAmount} from '../../utils/permit'
import Tooltip from '@fluent-wallet/component-tooltip'

const PermitRow = ({label, children, nested = false}) => (
  <div className={classNames('flex flex-wrap', nested && 'flex-col gap-4')}>
    <span className="shrink-0 text-sm font-normal text-gray-40 capitalize">
      {label}:
    </span>
    <div
      className={classNames(
        'flex min-w-0 justify-end gap-4 text-sm font-normal text-gray-80 break-all',
        nested ? 'flex-col ml-2' : 'ml-auto',
      )}
    >
      {children}
    </div>
  </div>
)

PermitRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  label: PropTypes.node.isRequired,
  nested: PropTypes.bool,
}

const PermitAmount = ({type, amount, tokenAddress}) => {
  const {t} = useTranslation()
  const amountBits = Number(type.replace('uint', ''))
  const token = useValid20Token(tokenAddress || '')
  const displayAmount = formatPermitAmount(
    amount,
    token?.decimals,
    amountBits,
    t('unlimited'),
  )
  return (
    <Tooltip content={displayAmount} placement="bottomLeft">
      <span className="truncate">{displayAmount}</span>
    </Tooltip>
  )
}

PermitAmount.propTypes = {
  type: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tokenAddress: PropTypes.string,
}

const renderValue = ({type, value, name, token}) => {
  if (type === 'address') {
    return name === 'token' ? (
      <PermitTokenInfo tokenAddress={value} />
    ) : (
      <Tooltip content={value} placement="bottomLeft">
        <span>{shortenAddress(formatIntoChecksumAddress(value))}</span>
      </Tooltip>
    )
  }
  if (
    (name === 'deadline' ||
      name === 'sigDeadline' ||
      name === 'expiration' ||
      name === 'expiry') &&
    type.startsWith('uint')
  ) {
    const date = dayjs(value * 1000)
    return date.isValid() ? date.format('YYYY/MM/DD HH:mm:ss') : String(value)
  }
  if (
    (name === 'amount' || name === 'value') &&
    type.startsWith('uint') &&
    token
  ) {
    return <PermitAmount type={type} amount={value} tokenAddress={token} />
  }
  return String(value)
}

const PermitMessageItem = ({name, type, types, value, token}) => {
  const nested = EndsWithArrayReg.test(type) || !!types[type]
  return (
    <PermitRow label={name} nested={nested}>
      {nested ? (
        <PermitMessages types={types} type={type} data={value} token={token} />
      ) : (
        renderValue({name, value, type, token})
      )}
    </PermitRow>
  )
}

PermitMessageItem.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  token: PropTypes.string,
  types: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
}

const PermitMessages = ({type, types, data, token}) => {
  if (EndsWithArrayReg.test(type)) {
    return Array.isArray(data)
      ? data.map((value, index) => {
          return (
            <PermitMessageItem
              key={index}
              name={`${index}`}
              type={type.replace(EndsWithArrayReg, '')}
              types={types}
              value={value}
              token={token}
            />
          )
        })
      : null
  }
  const messageTypes = types[type]
  if (!messageTypes || !Array.isArray(messageTypes)) return null

  return messageTypes.map(({name, type}, index) => {
    return (
      <PermitMessageItem
        key={index}
        name={name}
        type={type}
        types={types}
        value={data[name]}
        token={data.token ?? token}
      />
    )
  })
}

PermitMessages.propTypes = {
  type: PropTypes.string.isRequired,
  types: PropTypes.object.isRequired,
  data: PropTypes.any.isRequired,
  token: PropTypes.string,
}

function ViewPermitData() {
  const history = useHistory()
  const {t} = useTranslation()

  const permitType = usePermitType()

  useEffect(() => {
    if (!permitType) {
      history.push(REQUEST_SIGNATURE)
    }
  }, [permitType, history])

  if (!permitType) return null

  const {primaryType, message, types, domain} = permitType.typedData

  return (
    <div
      id="viemPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat"
    >
      <TitleNav title={t('viewData')} />
      <div
        className="mx-2 mt-3 px-2 py-4 bg-gray-4 flex flex-col flex-1 gap-4 overflow-y-auto"
        id="content"
      >
        <PermitRow label={t('primaryType')}>{primaryType}</PermitRow>
        <PermitMessages
          type={primaryType}
          types={types}
          data={message}
          token={
            permitType.type === 'permit' ? domain.verifyingContract : undefined
          }
        />
      </div>
    </div>
  )
}

export default ViewPermitData
