/**
 * @typedef {Object} PaymasterConfig
 * @property {string[]} smartAccountWhitelist Supported EIP-7702 delegate addresses.
 * @property {string[]} contractWhitelist Sponsored contract addresses.
 * @property {number} maxGasCost Maximum sponsored gas cost.
 */

/**
 * @typedef {Object} PaymasterStubRequest
 * @property {string} sender Smart account address.
 * @property {string} delegation EIP-7702 delegate address.
 */

/**
 * @typedef {Object} PaymasterStub
 * @property {string} address Verifying Paymaster address.
 * @property {string} data Stub paymaster data used for gas estimation.
 */

/**
 * @typedef {Object} PaymasterSignRequest
 * @property {string} sender Sender address.
 * @property {string} nonce Hex-encoded nonce.
 * @property {string} [factory] Factory address or EIP-7702 marker.
 * @property {string} [factoryData] Factory calldata.
 * @property {string} callData Account execution calldata.
 * @property {string} verificationGasLimit Account verification gas limit.
 * @property {string} callGasLimit Account call gas limit.
 * @property {string} preVerificationGas Pre-verification gas.
 * @property {string} maxFeePerGas Maximum fee per gas.
 * @property {string} maxPriorityFeePerGas Maximum priority fee per gas.
 * @property {string} signature Dummy account signature.
 * @property {string} paymaster Verifying Paymaster address.
 * @property {string} paymasterVerificationGasLimit Paymaster verification gas limit.
 * @property {string} paymasterPostOpGasLimit Paymaster post-operation gas limit.
 * @property {string} paymasterData Stub paymaster data used for estimation.
 */

export function createPaymasterMethods(request) {
  return {
    /**
     * Returns the Verifying Paymaster configuration exposed to clients.
     *
     * GET /aa/paymaster/config
     *
     * @returns {Promise<PaymasterConfig>}
     */
    getPaymasterConfig() {
      return request('/aa/paymaster/config')
    },

    /**
     * Returns stub paymaster data for gas estimation.
     *
     * POST /aa/paymaster/stub
     *
     * @param {PaymasterStubRequest} params Stub request parameters.
     * @returns {Promise<PaymasterStub>}
     */
    getPaymasterStub(params) {
      return request('/aa/paymaster/stub', {
        method: 'POST',
        body: params,
      })
    },

    /**
     * Validates and signs a UserOperation.
     *
     * POST /aa/paymaster/sign
     *
     * @param {PaymasterSignRequest} userOperation UserOperation to sign.
     * @returns {Promise<string>} Signed paymaster data.
     */
    signPaymasterUserOperation(userOperation) {
      return request('/aa/paymaster/sign', {
        method: 'POST',
        body: userOperation,
      })
    },
  }
}
