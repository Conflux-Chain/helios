// Admission only: listed addresses may be decoded with any supported swap ABI.
// This does not imply that each deployed router implements every supported ABI.
// Sources checked on 2026-11-12. Conflux names below are verified contract names;
// in particular, SwappiRouter02 is not Uniswap's SwapRouter02.
export const SWAP_ROUTER_ALLOWLIST = {
  // Ethereum mainnet: Uniswap SwapRouter02 (SWAP_ROUTER_02_ADDRESSES).
  // https://github.com/Uniswap/sdks/blob/main/sdks/sdk-core/src/addresses.ts
  1: ['0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
  // Conflux eSpace testnet; sources are ConfluxScan verified contracts.
  71: [
    // SwappiRouter
    // https://evmapi-testnet.confluxscan.org/api?module=contract&action=getsourcecode&address=0x873789aaf553fd0b4252d0d2b72c6331c47aff2e
    '0x873789aaf553fd0b4252d0d2b72c6331c47aff2e',
    // SwappiRouter02
    // https://evmapi-testnet.confluxscan.org/api?module=contract&action=getsourcecode&address=0x4f2c7ccd7b8d7a05bae594697b31e493d3be4535
    '0x4f2c7ccd7b8d7a05bae594697b31e493d3be4535',
    // WallFreeX Router
    // https://evmapi-testnet.confluxscan.org/api?module=contract&action=getsourcecode&address=0xddae0b2317505630854014ad0f9637d989073597
    '0xddae0b2317505630854014ad0f9637d989073597',
  ],
  // Conflux eSpace mainnet; sources are ConfluxScan verified contracts.
  1030: [
    // SwappiRouter
    // https://evmapi.confluxscan.org/api?module=contract&action=getsourcecode&address=0x62b0873055bf896dd869e172119871ac24aea305
    '0x62b0873055bf896dd869e172119871ac24aea305',
    // SwappiRouter02
    // https://evmapi.confluxscan.org/api?module=contract&action=getsourcecode&address=0xe37b52296b0baa91412cd0cd97975b0805037b84
    '0xe37b52296b0baa91412cd0cd97975b0805037b84',
    // WallFreeX Router
    // https://evmapi.confluxscan.org/api?module=contract&action=getsourcecode&address=0x3b02e356d09e758e2711bc64cf33e48f3e1239b8
    '0x3b02e356d09e758e2711bc64cf33e48f3e1239b8',
  ],
}

export const WRAPPED_NATIVE_TOKENS = {
  // Ethereum mainnet: WETH (Wrapped Ether), Uniswap SDK's WETH9[1].
  // https://github.com/Uniswap/sdks/blob/main/sdks/sdk-core/src/entities/weth9.ts
  1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  // Conflux eSpace testnet: WCFX (Wrapped CFX).
  // https://evmapi-testnet.confluxscan.org/api?module=contract&action=getsourcecode&address=0x2ed3dddae5b2f321af0806181fbfa6d049be47d8
  71: '0x2ed3dddae5b2f321af0806181fbfa6d049be47d8',
  // Conflux eSpace mainnet: WCFX (Wrapped Conflux).
  // https://evmapi.confluxscan.org/api?module=contract&action=getsourcecode&address=0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b
  1030: '0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b',
}
