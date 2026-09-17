import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import TitleNav from '../../components/TitleNav'
import {useSignatureRequest} from '../../hooks/useSignatureRequest'
import {formatIntoChecksumAddress} from '../../utils'
import {useValid20Token} from '../../hooks/useApi'
import {useEffect, useMemo} from 'react'
import {REQUEST_SIGNATURE} from '../../constants/route'
import {shortenAddress} from '@fluent-wallet/shorten-address'
import dayjs from 'dayjs'
import PermitTokenInfo from '../../components/PermitTokenInfo'
import {
  detectPermit,
  EndsWithArrayReg,
  formatPermitAmount,
  getPermitFieldDisplay,
} from '../../utils/permit'
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

const renderRawValue = value => {
  if (value === undefined) return '-'
  if (value === null) return 'null'
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

const renderValue = ({type, value, display}) => {
  if (value == null || typeof value === 'object') return renderRawValue(value)
  if (display?.kind === 'token' && typeof value === 'string') {
    return <PermitTokenInfo tokenAddress={value} />
  }
  if (type === 'address' && typeof value === 'string') {
    try {
      return (
        <Tooltip content={value} placement="bottomLeft">
          <span>{shortenAddress(formatIntoChecksumAddress(value))}</span>
        </Tooltip>
      )
    } catch {
      return value
    }
  }
  if (display?.kind === 'date' && type.startsWith('uint')) {
    const date = dayjs(value * 1000)
    return date.unix() === 0
      ? '0'
      : date.isValid()
      ? date.format('YYYY/MM/DD HH:mm:ss')
      : String(value)
  }
  if (
    display?.kind === 'amount' &&
    type.startsWith('uint') &&
    display.tokenAddress
  ) {
    return (
      <PermitAmount
        type={type}
        amount={value}
        tokenAddress={display.tokenAddress}
      />
    )
  }
  return renderRawValue(value)
}

const PermitMessageItem = ({
  name,
  type,
  types,
  value,
  typedData,
  descriptor,
  path,
}) => {
  const nested = EndsWithArrayReg.test(type) || !!types[type]
  return (
    <PermitRow label={name} nested={nested}>
      {nested ? (
        <PermitMessages
          type={type}
          data={value}
          typedData={typedData}
          descriptor={descriptor}
          path={path}
        />
      ) : (
        renderValue({
          type,
          value,
          display: getPermitFieldDisplay(typedData, descriptor, path),
        })
      )}
    </PermitRow>
  )
}

PermitMessageItem.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  types: PropTypes.object.isRequired,
  value: PropTypes.any,
  typedData: PropTypes.object.isRequired,
  descriptor: PropTypes.object.isRequired,
  path: PropTypes.array.isRequired,
}

export const PermitMessages = ({
  type,
  data,
  typedData,
  descriptor,
  path = [],
}) => {
  const {types} = typedData
  if (data == null) return renderRawValue(data)
  if (EndsWithArrayReg.test(type)) {
    if (!Array.isArray(data) || data.length === 0) return renderRawValue(data)
    return data.map((value, index) => (
      <PermitMessageItem
        key={index}
        name={`${index}`}
        type={type.replace(EndsWithArrayReg, '')}
        types={types}
        value={value}
        typedData={typedData}
        descriptor={descriptor}
        path={[...path, index]}
      />
    ))
  }
  const fieldDefinitions = types[type]
  if (
    !Array.isArray(fieldDefinitions) ||
    typeof data !== 'object' ||
    Array.isArray(data)
  ) {
    return renderRawValue(data)
  }
  return fieldDefinitions.map(({name, type}, index) => (
    <PermitMessageItem
      key={index}
      name={name}
      type={type}
      types={types}
      value={data[name]}
      typedData={typedData}
      descriptor={descriptor}
      path={[...path, name]}
    />
  ))
}

PermitMessages.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.any,
  typedData: PropTypes.object.isRequired,
  descriptor: PropTypes.object.isRequired,
  path: PropTypes.array,
}

function ViewPermitData() {
  const history = useHistory()
  const {t} = useTranslation()

  const {typedData} = useSignatureRequest()

  const permitDescriptor = useMemo(() => detectPermit({typedData}), [typedData])

  useEffect(() => {
    if (!permitDescriptor) {
      history.push(REQUEST_SIGNATURE)
    }
  }, [permitDescriptor, history])

  if (!permitDescriptor) return null

  const {primaryType, message} = typedData

  return (
    <div
      id="viewPermitDataContainer"
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
          data={message}
          typedData={typedData}
          descriptor={permitDescriptor}
        />
      </div>
    </div>
  )
}

export default ViewPermitData
