import rndId from '@fluent-wallet/random-id'

export const requestFactory = (sendRequest, req) => {
  req.jsonrpc = '2.0'
  req.id = req.id ?? rndId()
  return sendRequest(req)
}

export function deprecated(type, message) {
  // TODO: write a notice about deprecated warnings and add its url here
  console.warn(`%cDEPRECATED ${type}: ${message}`, 'color: red')
}

// DEPRECATED
export function protectDeprecatedEvent(eventType) {
  if (eventType === 'chainIdChanged') {
    eventType = 'chainChanged'
    deprecated(
      'EVENT',
      '"chainIdChanged" event is deprecated, it might be removed anytime without warning. Use "chainChanged" instead',
    )
  } else if (eventType === 'networkChanged') {
    deprecated(
      'EVENT',
      '"networkChanged" event is deprecated, it might be removed anytime without warning. Use "chainChanged" instead',
    )
  } else if (eventType === 'close') {
    eventType = 'disconnect'
    deprecated(
      'EVENT',
      '"close" event is deprecated, it might be removed anytime without warning. Use "disconnect" instead',
    )
  } else if (eventType === 'notification') {
    eventType = 'message'
    deprecated(
      'EVENT',
      '"notification" event is deprecated, it might be removed anytime without warning. Use "message" instead',
    )
  }
  return eventType
}
