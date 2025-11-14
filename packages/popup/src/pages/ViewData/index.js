import {useTranslation} from 'react-i18next'
import {TitleNav} from '../../components'
import {useDappParams, useDecodeData} from '../../hooks'
import {transformToTitleCase} from '../../utils'
import {BigNumber} from '@ethersproject/bignumber'

const formatValue = value => {
  if (value === null || value === undefined) return ''
  if (BigNumber.isBigNumber(value)) {
    return value.toString(10)
  } else {
    return `${value}`
  }
}

const renderArgValue = (value, param, level = 0, keyPrefix = '') => {
  if (!param) {
    return (
      <span className="text-sm text-gray-80 break-words">
        {formatValue(value)}
      </span>
    )
  }
  // array
  if (param.baseType === 'array') {
    if (!Array.isArray(value)) {
      return (
        <span className="text-sm text-gray-80 break-words">
          {formatValue(value)}
        </span>
      )
    }
    const childParam = param.arrayChildren
    if (!childParam) {
      return (
        <span className="text-sm text-gray-80 break-words">
          {value.map((v, i) => `[${i}]: ${formatValue(v)}`).join(', ')}
        </span>
      )
    }
    return (
      <div className="flex flex-col">
        {value.map((item, index) => (
          <div
            key={`${keyPrefix}${index}`}
            className={level === 0 ? 'flex flex-col' : 'flex flex-col ml-3'}
          >
            <span className="text-xs text-gray-40">{`[${index}]`}</span>
            {renderArgValue(
              item,
              childParam,
              level + 1,
              `${keyPrefix}${index}.`,
            )}
          </div>
        ))}
      </div>
    )
  }

  // tuple
  if (param.baseType === 'tuple') {
    const components = param.components || []
    if (value == null) return null

    return (
      <div className="flex flex-col">
        {components.map((component, compIndex) => {
          const name = component.name || `field_${compIndex}`
          const compValue =
            value && value[name] !== undefined
              ? value[name]
              : value?.[compIndex]

          return (
            <div
              key={`${keyPrefix}${name}_${compIndex}`}
              className={level === 0 ? 'flex flex-col' : 'flex flex-col ml-3'}
            >
              <span className="text-xs text-gray-40">
                {`${name} (${component.type})`}
              </span>
              {renderArgValue(
                compValue,
                component,
                level + 1,
                `${keyPrefix}${name}_${compIndex}.`,
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <span className="text-sm text-gray-80 break-words">
      {formatValue(value)}
    </span>
  )
}

function ViewData() {
  const {t} = useTranslation()
  const tx = useDappParams()
  const {decodeData, data: contractData} = useDecodeData(tx)
  const contractMethod = decodeData?.name
    ? transformToTitleCase(decodeData.name)
    : ''

  const args = !contractMethod ? [] : decodeData?.args || []
  const inputs = decodeData?.functionFragment?.inputs || []

  return contractData ? (
    <div
      id="editPermissionContainer"
      className="h-full w-full flex flex-col bg-blue-circles bg-no-repeat"
    >
      <TitleNav title={t('transactionDetails')} />
      <div
        className="mx-2 mt-3 px-2 py-4 bg-gray-4 flex flex-col flex-1 overflow-y-auto"
        id="content"
      >
        {!!contractMethod && (
          <div>
            <p className="text-xs text-gray-40 mb-0.5">{t('functionName')}</p>
            <div className="text-sm text-gray-80 mb-3">{contractMethod}</div>
          </div>
        )}

        <div className="mb-3">
          {args.length > 0 &&
            args.map((arg, index) => {
              const param = inputs[index]
              return (
                <div key={index} className="flex flex-col mb-1">
                  <span className="text-xs text-gray-40">
                    {`params #${index + 1}`}
                  </span>
                  {renderArgValue(arg, param, 0, `arg${index}.`)}
                </div>
              )
            })}
        </div>

        <div>
          <p className="text-xs text-gray-40 mb-0.5">{t('hexData')}</p>
          <div className="text-sm text-gray-80 mb-3 break-words">
            {contractData}
          </div>
        </div>
      </div>
    </div>
  ) : null
}

export default ViewData
