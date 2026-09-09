/**
 * @typedef {Object} PaymasterStub
 * @property {string} address Verifying Paymaster address.
 * @property {string} data 77-byte stub data for gas estimation.
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
 * @property {string} paymasterData Stub Paymaster data used for estimation.
 * @property {string} delegatedContract EIP-7702 delegate, or zero address.
 */

export function createPaymasterMethods(request) {
  return {
    /**
     * Returns dummy Paymaster data for gas estimation.
     * This endpoint does not check sponsorship eligibility.
     * GET /aa/paymaster/stub
     *
     * @returns {Promise<PaymasterStub>}
     */
    getPaymasterStub() {
      return request('/aa/paymaster/stub')
    },

    /**
     * Validates and signs a flat UserOperationWithAuth.
     * Returns the signed 77-byte paymasterData only.
     * POST /aa/paymaster/sign
     *
     * @param {PaymasterSignRequest} userOperation UserOperation to sign.
     * @returns {Promise<string>}
     */
    signPaymasterUserOperation(userOperation) {
      return request('/aa/paymaster/sign', {
        method: 'POST',
        body: userOperation,
      })
    },
  }
}
