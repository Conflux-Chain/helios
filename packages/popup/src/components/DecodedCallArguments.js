import PropTypes from 'prop-types'
import {BigNumber} from '@ethersproject/bignumber'

function renderArgumentValue(value, parameter, level = 0) {
  if (parameter.baseType === 'array') {
    return (
      <div className="flex flex-col">
        {value.map((item, index) => (
          <div
            key={index}
            className={level === 0 ? 'flex flex-col' : 'flex flex-col ml-3'}
          >
            <span className="text-xs text-gray-40">{`[${index}]`}</span>
            {renderArgumentValue(item, parameter.arrayChildren, level + 1)}
          </div>
        ))}
      </div>
    )
  }

  if (parameter.baseType === 'tuple') {
    return (
      <div className="flex flex-col">
        {parameter.components.map((component, index) => {
          const name = component.name || `field_${index}`

          return (
            <div
              key={index}
              className={level === 0 ? 'flex flex-col' : 'flex flex-col ml-3'}
            >
              <span className="text-xs text-gray-40">
                {`${name} (${component.type})`}
              </span>
              {renderArgumentValue(value[index], component, level + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <span className="text-sm text-gray-80 break-words">
      {BigNumber.isBigNumber(value) ? value.toString() : String(value ?? '')}
    </span>
  )
}

function DecodedCallArguments({args, inputs}) {
  return (
    <div className="mb-3">
      {args.map((value, index) => (
        <div key={index} className="flex flex-col mb-1">
          <span className="text-xs text-gray-40">{`params #${index + 1}`}</span>
          {renderArgumentValue(value, inputs[index])}
        </div>
      ))}
    </div>
  )
}

DecodedCallArguments.propTypes = {
  args: PropTypes.array.isRequired,
  inputs: PropTypes.array.isRequired,
}

export default DecodedCallArguments
