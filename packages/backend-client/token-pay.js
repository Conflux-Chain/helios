/**
 * @typedef {Object} TokenPayConfig
 * @property {string[]} tokens Supported ERC20 token addresses.
 * @property {string} recipient Token payment recipient.
 * @property {number} minGasFeeRatio Minimum gas fee ratio in percent.
 * @property {number} minGasTipRatio Minimum gas tip ratio in percent.
 * @property {number} maxGasCost Maximum gas cost in wei.
 * @property {number} suggestedGasPriceBumpRatio Gas price bump ratio in percent.
 * @property {number} suggestedTokenPriceBumpRatio Token price bump ratio in percent.
 */

/**
 * @typedef {Object} TokenPayTransactions
 * @property {string} rawTransferTokenTx Signed token transfer transaction.
 * @property {string} rawBusinessTx Signed business transaction.
 */

export function createTokenPayMethods(request) {
  return {
    /**
     * Returns token-pay configuration.
     * GET /tokenpay/config
     *
     * @returns {Promise<TokenPayConfig>}
     */
    getTokenPayConfig() {
      return request('/tokenpay/config')
    },

    /**
     * Returns the token amount for 1 ETH.
     * The result is a decimal string in the token's smallest unit.
     * GET /tokenpay/price?token={tokenAddress}
     *
     * @param {string} tokenAddress ERC20 token address.
     * @returns {Promise<string>}
     */
    getTokenPayPrice(tokenAddress) {
      const token = encodeURIComponent(tokenAddress)

      return request(`/tokenpay/price?token=${token}`)
    },

    /**
     * Submits the signed token-pay transactions.
     * The backend accepts the request and starts the sponsorship flow.
     * POST /tokenpay/submit
     *
     * @param {TokenPayTransactions} transactions Signed raw transactions.
     * @returns {Promise<void>}
     */
    async submitTokenPayTransactions({rawTransferTokenTx, rawBusinessTx}) {
      await request('/tokenpay/submit', {
        method: 'POST',
        body: {
          rawTransferTokenTx,
          rawBusinessTx,
        },
      })
    },
  }
}
