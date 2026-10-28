import {useTranslation} from 'react-i18next'
import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'
import TitleNav from '../../components/TitleNav'
import {useSignatureRequestData} from '../../hooks/useSignatureRequestData'
import {useEffect, useMemo} from 'react'
import {REQUEST_SIGNATURE} from '../../constants/route'
import dayjs from 'dayjs'
import PermitTokenInfo from '../../components/PermitTokenInfo'
import {
  detectPermit,
  EndsWithArrayReg,
  getPermitFieldDisplay,
} from '../../utils/permit'
import PermitAmount from './components/PermitAmount'
import PermitRow from './components/PermitRow'
import PermitAddress from './components/PermitAddress'

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
    return <PermitAddress address={value} />
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
    return <PermitAmount amount={value} tokenAddress={display.tokenAddress} />
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

  const {typedData} = useSignatureRequestData()

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
