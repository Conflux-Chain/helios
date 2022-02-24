export default {
  metadata: {
    provider: true,
  },
  en: `Request user to sign a transaction and broadcast it.

Use the corresponding cfx/eth rpc depends on current network.
Return the result of \`cfx/eth_sendRawTransaction\`.

Note: \`nonce\` is ignored.
`,
}
