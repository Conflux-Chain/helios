export const TOKEN_PAY_DEFAULT_GAS_LEVEL = 'medium'
export const ADVANCED_GAS_LEVEL = 'advanced'

export function getTokenPayGasLevel(gasLevel) {
  // The token pay gas not support advanced mode so return medium instead
  return gasLevel === ADVANCED_GAS_LEVEL || !gasLevel
    ? TOKEN_PAY_DEFAULT_GAS_LEVEL
    : gasLevel
}
