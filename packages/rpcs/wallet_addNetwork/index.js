/**
 * @fileOverview rpc defination of wallet_addNetwork
 * @name index.js
 */

export const NAME = 'wallet_addNetwork'

export const permissions = {
  methods: ['cfx_getState', 'wallet_getNetworkConfig'],
}

export async function main() {}
