const unsupportedCodes = new Set([-32601, -32004, 4200])
const unsupportedMessages = [
  /\baccess\s+forbidden\s+by\s+allowlists?\s*:\s*bad\s+request\s+method\b/i,
  /\b(?:unsupported|unknown|unrecognized|unavailable|disabled)\s+(?:rpc\s+)?(?:method|tracer|tracing)\b/i,
  /\b(?:method|tracer|tracing)\s+(?:(?:is|was|has been)\s+)?(?:not\s+(?:found|supported|available|enabled|implemented)|disabled|unavailable)\b/i,
  /\b(?:debug_tracecall|calltracer|debug\s+(?:api|namespace)|tracerconfig|withlog|onlytopcall)['"`]?\s+(?:(?:is|was|has been)\s+)?(?:does not exist|not\s+(?:found|supported|available|enabled|implemented|allowed|whitelisted)|disabled|unavailable)\b/i,
  /\b(?:unknown|unrecognized|unsupported)\s+(?:field|option)\s+['"`]?(?:tracer|tracerconfig|withlog|onlytopcall)\b/i,
  /\bno\s+(?:such\s+)?tracer\b/i,
]

function errorMessage(error) {
  return String(error?.message ?? '')
    .split(/\nRPC Stack:/i)[0]
    .trim()
}

export function isExecutionRevertError(error) {
  // Code 3 is used by Ethereum nodes for execution reverts. Other nodes use
  // a generic server code, so accept the explicit message prefix as well.
  return (
    Number(error?.code) === 3 ||
    /^execution reverted(?:$|[\s:])/i.test(errorMessage(error))
  )
}

export function isUnsupportedTraceError(error) {
  if (isExecutionRevertError(error)) return false
  if (unsupportedCodes.has(Number(error?.code))) return true
  const message = errorMessage(error)
  // A contract's revert reason may itself say "unsupported method".
  if (
    /\b(?:execution reverted|revert(?:ed)?|out of gas|insufficient funds|invalid opcode)\b/i.test(
      message,
    )
  )
    return false

  return unsupportedMessages.some(pattern => pattern.test(message))
}

export function failedEstimate(status, error, includeTransfers) {
  return {
    status,
    changes: [],
    ...(includeTransfers ? {transfers: []} : {}),
    error: {
      message: error?.message || 'Asset change estimation failed',
      ...(typeof error?.code === 'number' ? {code: error.code} : {}),
      ...(error?.data !== undefined ? {data: error.data} : {}),
    },
  }
}
