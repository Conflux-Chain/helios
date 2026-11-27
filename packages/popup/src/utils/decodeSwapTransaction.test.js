import {Interface} from '@ethersproject/abi'
import {BigNumber} from '@ethersproject/bignumber'
import {describe, expect, it} from 'vitest'
import {
  V2_SWAP_ABI,
  V3_SWAP_ABI,
  V3_SWAP_ROUTER_02_ABI,
  SWAP_MULTICALL_ABI,
} from '@fluent-wallet/contract-abis/swap-abi.js'
import {decodeSwapTransaction} from './decodeSwapTransaction'
import fixtures from './test/fixtures/wallfreexSwap.json'

const v2 = new Interface(V2_SWAP_ABI)
const v3 = new Interface(V3_SWAP_ABI)
const v302 = new Interface(V3_SWAP_ROUTER_02_ABI)
const helpers = new Interface(SWAP_MULTICALL_ABI)
const tokenIn = '0x1111111111111111111111111111111111111111'
const tokenOut = '0x2222222222222222222222222222222222222222'
const intermediate = '0x3333333333333333333333333333333333333333'
const sender = '0x4444444444444444444444444444444444444444'
const other = '0x5555555555555555555555555555555555555555'
const zero = '0x0000000000000000000000000000000000000000'
const one = '0x0000000000000000000000000000000000000001'
const two = '0x0000000000000000000000000000000000000002'
const router = '0xddae0b2317505630854014ad0f9637d989073597'
const wrapped = '0x2ed3dddae5b2f321af0806181fbfa6d049be47d8'
const network = {type: 'eth', chainId: '0x47'}
const maxUint =
  '115792089237316195423570985008687907853269984665640564039457584007913129639935'
const native = {type: 'native'}
const token = address => ({type: 'erc20', address: address.toLowerCase()})
const transaction = (data, overrides = {}) => ({
  from: sender,
  to: router,
  data,
  ...overrides,
})
const decode = (data, overrides, net = network) =>
  decodeSwapTransaction(transaction(data, overrides), net)
const path = (tokens = [tokenIn, intermediate, tokenOut], fees = [500, 3000]) =>
  tokens.reduce(
    (packed, address, i) =>
      packed +
      (i ? fees[i - 1].toString(16).padStart(6, '0') : '') +
      address.slice(2),
    '0x',
  )
const swap = (iface = v3, method = 'exactInput', overrides = {}) =>
  iface.encodeFunctionData(method, [
    {
      tokenIn,
      tokenOut,
      fee: 500,
      path: path(
        method.startsWith('exactOutput')
          ? [tokenOut, intermediate, tokenIn]
          : undefined,
      ),
      recipient: sender,
      deadline: 2000000000,
      amountIn: '10',
      amountOutMinimum: '20',
      amountOut: '20',
      amountInMaximum: '10',
      sqrtPriceLimitX96: 0,
      ...overrides,
    },
  ])
const multicall = calls =>
  helpers.encodeFunctionData('multicall(bytes[])', [calls])
const refund = helpers.encodeFunctionData('refundETH')
const sweep = (asset = tokenOut, recipient = sender) =>
  helpers.encodeFunctionData('sweepToken(address,uint256,address)', [
    asset,
    0,
    recipient,
  ])
const unwrap = (recipient = sender) =>
  helpers.encodeFunctionData('unwrapWETH9(uint256,address)', [0, recipient])

describe('swap admission', () => {
  it('rejects a configured router on another chain', () => {
    expect(decode(swap(), {}, {type: 'eth', chainId: 1030})).toBeNull()
  })
  it('rejects router addresses outside the allowlist', () => {
    expect(decode(swap(), {to: other})).toBeNull()
  })

  it.each([
    {type: 'cfx', chainId: 71},
    {type: 'eth', chainId: 999},
  ])('rejects unsupported networks: %j', net => {
    expect(decode(swap(), {}, net)).toBeNull()
  })
})

describe('transaction input validation', () => {
  it('uses input calldata only if data is absent', () => {
    expect(decode(undefined, {input: swap()})).toMatchObject({
      input: {amount: '10'},
      output: {amount: '20'},
    })
    expect(decode('0x', {input: swap()})).toBeNull()
  })
})

describe('V2 direct calls', () => {
  const iface = v2
  const recipient = '0x1A44444444444444444444444444444444444444'
  const tail = [[tokenIn, intermediate, tokenOut], recipient, 2000000000]
  const inputToken = token(tokenIn)
  const outputToken = token(tokenOut)
  const decodeSwap = tx => decodeSwapTransaction(tx, network)

  it.each([
    ['swapExactETHForTokens', '0x7ff36ab5', [20, ...tail], native, outputToken],
    [
      'swapExactTokensForETH',
      '0x18cbafe5',
      [10, 20, ...tail],
      inputToken,
      native,
    ],
    [
      'swapExactTokensForTokens',
      '0x38ed1739',
      [10, 20, ...tail],
      inputToken,
      outputToken,
    ],
    ['swapETHForExactTokens', '0xfb3bdb41', [20, ...tail], native, outputToken],
    [
      'swapTokensForExactTokens',
      '0x8803dbee',
      [20, 10, ...tail],
      inputToken,
      outputToken,
    ],
    [
      'swapExactTokensForTokensSupportingFeeOnTransferTokens',
      '0x5c11d795',
      [10, 20, ...tail],
      inputToken,
      outputToken,
    ],
  ])(
    'decodes %s with the expected selector and route endpoints',
    (method, selector, args, inputAsset, outputAsset) => {
      const data = iface.encodeFunctionData(method, args)
      expect(data.slice(0, 10)).toBe(selector)
      const exactInput = method.startsWith('swapExact')
      expect(
        decodeSwap({
          from: recipient,
          to: router,
          data,
          value: inputAsset.type === 'native' ? '0xa' : '0x0',
        }),
      ).toEqual({
        method,
        recipient,
        input: {
          asset: inputAsset,
          amount: '10',
          amountType: exactInput ? 'exact' : 'maximum',
        },
        output: {
          asset: outputAsset,
          amount: '20',
          amountType: exactInput ? 'minimum' : 'exact',
        },
      })
    },
  )

  it('preserves amounts above Number.MAX_SAFE_INTEGER', () => {
    const amount = '123456789012345678901234567890'
    const tx = {
      from: recipient,
      to: router,
      data: iface.encodeFunctionData('swapETHForExactTokens', [
        amount,
        ...tail,
      ]),
      value: '0x20000000000001',
    }
    expect(decodeSwap(tx)).toMatchObject({
      input: {amount: '9007199254740993', amountType: 'maximum'},
      output: {amount, amountType: 'exact'},
    })
  })
})

describe('V3 direct calls', () => {
  it.each([
    [v3, 'exactInput', '0xc04b8d59', true],
    [v3, 'exactOutputSingle', '0xdb3e2198', false],
    [v302, 'exactInputSingle', '0x04e45aaf', true],
    [v302, 'exactOutput', '0x09b81346', false],
  ])('decodes %s %s (%s)', (iface, method, selector, exactInput) => {
    const data = swap(iface, method)
    expect(data.slice(0, 10)).toBe(selector)
    expect(decode(data)).toEqual({
      method,
      recipient: sender,
      input: {
        asset: token(tokenIn),
        amount: '10',
        amountType: exactInput ? 'exact' : 'maximum',
      },
      output: {
        asset: token(tokenOut),
        amount: '20',
        amountType: exactInput ? 'minimum' : 'exact',
      },
    })
  })
  it.each(['exactInput', 'exactOutput'])(
    'keeps large amounts and zero/unlimited bounds for %s',
    method => {
      const data = swap(v3, method, {
        amountIn: '90071992547409930000',
        amountOutMinimum: 0,
        amountOut: '90071992547409930001',
        amountInMaximum: maxUint,
      })
      expect(decode(data)).toMatchObject(
        method === 'exactInput'
          ? {input: {amount: '90071992547409930000'}, output: {amount: '0'}}
          : {
              input: {amount: maxUint},
              output: {amount: '90071992547409930001'},
            },
      )
    },
  )
  it('omits output sent to someone other than the sender', () => {
    expect(decode(swap(v3, 'exactInput', {recipient: other}))).toMatchObject({
      input: {amount: '10'},
      output: null,
    })
  })
  it('interprets recipient sentinels from the matched signature, not the router address', () => {
    expect(decode(swap(v302, 'exactInput', {recipient: one}))).toMatchObject({
      recipient: sender,
      output: {amount: '20'},
    })
    for (const [iface, recipient] of [
      [v3, zero],
      [v302, two],
    ]) {
      expect(decode(swap(iface, 'exactInput', {recipient}))).toMatchObject({
        recipient: router,
        output: null,
      })
    }
    expect(decode(swap(v3, 'exactInput', {recipient: one}))).toMatchObject({
      recipient: one,
      output: null,
    })
  })
  it('rejects a truncated packed path', () => {
    expect(
      decode(swap(v3, 'exactInput', {path: path().slice(0, -2)})),
    ).toBeNull()
  })
  it('rejects a standalone cyclic path', () => {
    expect(
      decode(
        swap(v3, 'exactInput', {path: path([tokenIn, intermediate, tokenIn])}),
      ),
    ).toBeNull()
  })
  it('rejects a price limit that could allow a partial fill', () => {
    expect(
      decode(swap(v3, 'exactInputSingle', {sqrtPriceLimitX96: 1})),
    ).toBeNull()
  })
  it('rejects Router02 spending an unknown router balance', () => {
    expect(decode(swap(v302, 'exactInput', {amountIn: 0}))).toBeNull()
  })
})

describe('V3 multicall composition', () => {
  it.each(['exactInput', 'exactOutput'])(
    'sums independent %s routes without rounding or overflow',
    method => {
      const calls = [
        swap(v3, method, {
          amountIn: '9007199254740993',
          amountInMaximum: maxUint,
        }),
        swap(v302, `${method}Single`, {
          amountOutMinimum: '37',
          amountOut: '37',
        }),
      ]
      expect(decode(multicall(calls))).toMatchObject({
        method: 'multicall',
        recipient: sender,
        input: {
          amount:
            method === 'exactInput'
              ? '9007199254741003'
              : BigNumber.from(maxUint).add(10).toString(),
        },
        output: {amount: '57'},
      })
    },
  )
  it.each([
    [
      'sweepToken(address,uint256,address)',
      [tokenOut, 0, sender],
      tokenOut,
      token(tokenOut),
    ],
    ['unwrapWETH9(uint256)', [0], wrapped, native],
  ])(
    'resolves output settlement through %s',
    (method, args, outputToken, asset) => {
      expect(
        decode(
          multicall([
            swap(v302, 'exactInput', {
              recipient: two,
              path: path([tokenIn, outputToken], [500]),
            }),
            helpers.encodeFunctionData(method, args),
          ]),
        ),
      ).toMatchObject({recipient: sender, output: {asset, amount: '20'}})
    },
  )
  it.each([
    ['sweepToken(address,uint256,address)', [tokenOut, 100, sender], tokenOut],
    ['unwrapWETH9(uint256)', [100], wrapped],
  ])(
    'uses the %s minimum for router-held split output',
    (method, args, asset) => {
      const leg = swap(v302, 'exactInputSingle', {
        recipient: two,
        tokenOut: asset,
        amountOutMinimum: 0,
      })
      expect(
        decode(multicall([leg, leg, helpers.encodeFunctionData(method, args)])),
      ).toMatchObject({output: {amount: '100', amountType: 'minimum'}})
    },
  )
  it.each([
    [50, '70'],
    [30, '60'],
  ])(
    'applies a sweep minimum of %i only to router-held legs',
    (minimum, expected) => {
      const held = swap(v3, 'exactInput', {recipient: zero})
      const settlement = helpers.encodeFunctionData(
        'sweepToken(address,uint256)',
        [tokenOut, minimum],
      )
      expect(decode(multicall([swap(), held, held, settlement]))).toMatchObject(
        {
          output: {amount: expected, amountType: 'minimum'},
        },
      )
    },
  )
  it('preserves the declared exact output with a higher settlement minimum', () => {
    const held = swap(v3, 'exactOutput', {recipient: zero})
    const settlement = helpers.encodeFunctionData(
      'sweepToken(address,uint256)',
      [tokenOut, 100],
    )
    expect(decode(multicall([held, settlement]))).toMatchObject({
      output: {amount: '20', amountType: 'exact'},
    })
  })
  it('aggregates direct and router-held output only when the final asset and recipient match', () => {
    expect(
      decode(
        multicall([swap(), swap(v3, 'exactInput', {recipient: zero}), sweep()]),
      ),
    ).toMatchObject({recipient: sender, output: {amount: '40'}})
  })
  it.each([
    ['unknown', [swap(), '0x12345678']],
    ['malformed swap', [swap(), '0xc04b8d59']],
    ['swap after refund', [swap(), refund, swap()]],
    ['unrelated sweep', [swap(), sweep()]],
    ['wrong token', [swap(v3, 'exactInput', {recipient: zero}), sweep(other)]],
    [
      'different output tokens',
      [swap(), swap(v3, 'exactInput', {path: path([tokenIn, other], [500])})],
    ],
    [
      'different final recipients',
      [
        swap(),
        swap(v3, 'exactInput', {recipient: zero}),
        sweep(tokenOut, other),
      ],
    ],
    [
      'swap after settlement',
      [swap(v3, 'exactInput', {recipient: zero}), sweep(), swap()],
    ],
  ])('rejects unsupported composition: %s', (_, calls) => {
    expect(decode(multicall(calls))).toBeNull()
  })
})

describe('V3 native currencies', () => {
  it.each([
    [
      1,
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    ],
    [71, router, wrapped],
    [
      1030,
      '0x3b02e356d09e758e2711bc64cf33e48f3e1239b8',
      '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
    ],
  ])(
    'uses the configured native wrapper on chain %s',
    (chainId, to, wrapper) => {
      const data = swap(v3, 'exactInputSingle', {tokenIn: wrapper})
      expect(
        decode(data, {to, value: '0xa'}, {type: 'eth', chainId}),
      ).toMatchObject({input: {asset: native, amount: '10'}})
      expect(decode(data, {to}, {type: 'eth', chainId})).toMatchObject({
        input: {asset: token(wrapper)},
      })
    },
  )
  it('requires enough value for all routes and a refund for excess value', () => {
    const calls = [
      swap(v3, 'exactOutputSingle', {tokenIn: wrapped, amountInMaximum: 1601}),
      swap(v3, 'exactOutputSingle', {tokenIn: wrapped, amountInMaximum: 1601}),
    ]
    expect(decode(multicall([...calls, refund]), {value: 3203})).toMatchObject({
      input: {asset: native, amount: '3202', amountType: 'maximum'},
      output: {amount: '40'},
    })
    expect(decode(multicall(calls), {value: 3202})).not.toBeNull()
    expect(decode(multicall(calls), {value: 3203})).toBeNull()
    expect(decode(multicall([...calls, refund]), {value: 3201})).toBeNull()
  })
  it('rejects native value when the input token is not wrapped native', () => {
    expect(decode(swap(), {value: 10})).toBeNull()
  })
  it('does not conflate wrapped and native outputs in a split', () => {
    const args = {path: path([tokenIn, wrapped], [500])}
    expect(
      decode(
        multicall([
          swap(v3, 'exactInput', args),
          swap(v3, 'exactInput', {...args, recipient: zero}),
          unwrap(),
        ]),
      ),
    ).toBeNull()
  })
})

describe('WallFreeX reference calldata', () => {
  // Captured by executing v3-interface handleSwap with a mocked sender.
  // The fixture has no runtime dependency on the reference checkout or SDK.
  it.each(fixtures.cases)('decodes $id', ({tx, network: net, expected}) => {
    expect(decodeSwapTransaction(tx, net)).toEqual(expected)
  })
})
