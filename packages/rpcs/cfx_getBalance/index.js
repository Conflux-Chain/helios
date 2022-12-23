import {cat, base32Address, epochRefNoMined} from '@fluent-wallet/spec'

export const NAME = 'cfx_getBalance'

export const schemas = {
  input: [cat, base32Address, epochRefNoMined],
}

export const cache = {
  type: 'epoch',
  key: ({params}) => `${NAME}${params[0]}`,
}

export const permissions = {
  locked: true,
  external: ['popup', 'inpage'],
}
// 这里的f 其实就是 rpc engine 里的 fetch.js 通过ky 库 直接调用 endpoint 的cfx_getBalance 方法
export const main = async ({f, params}) => {
  return await f(params)
}
