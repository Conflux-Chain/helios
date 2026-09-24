import {encode} from '@fluent-wallet/base32-address'

/**
 * Convert address arguments to Core Space base32 addresses.
 * Leave the original result unchanged.
 * Return null if there is no result or conversion fails.
 */
export function formatConfluxCallAddresses(decodedCall, networkId) {
  if (!decodedCall) return null

  try {
    return {
      ...decodedCall,
      args: formatArguments(
        decodedCall.args,
        decodedCall.functionFragment.inputs,
        networkId,
      ),
    }
  } catch {
    return null
  }
}

function formatArgument(value, param, networkId) {
  // Use ABI types to avoid treating bytes and strings as addresses.
  switch (param.baseType) {
    case 'address':
      return encode(value, networkId)
    case 'array':
      return value.map(item =>
        formatArgument(item, param.arrayChildren, networkId),
      )
    case 'tuple':
      return formatArguments(value, param.components, networkId)
    default:
      return value
  }
}

function formatArguments(args, inputs, networkId) {
  const formattedArgs = inputs.map((input, index) =>
    formatArgument(args[index], input, networkId),
  )

  // Keep access by name, such as args.spender.
  // Skip names shared by multiple parameters.
  const nameCounts = new Map()
  for (const {name} of inputs) {
    if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1)
  }

  inputs.forEach(({name}, index) => {
    if (!name || nameCounts.get(name) !== 1) return

    // Use _length because length already holds the array size.
    const key = name === 'length' ? '_length' : name

    // Do not overwrite existing array properties.
    if (formattedArgs[key] != null) return

    formattedArgs[key] = formattedArgs[index]
  })

  return formattedArgs
}
