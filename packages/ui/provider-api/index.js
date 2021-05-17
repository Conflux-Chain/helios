import rndId from '@cfxjs/random-id'

const requestFactory = (sendRequest, req) => {
  req.jsonrpc = '2.0'
  req.id = req.id ?? rndId()
  return sendRequest(req)
}

export const initProvider = sendRequest => {
  return {request: req => requestFactory(sendRequest, req)}
}
