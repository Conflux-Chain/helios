import {readFileSync} from 'fs'
import {strictEqual} from 'assert/strict'

const content = readFileSync('./fullnode_error_messages_check.txt', {
  encoding: 'utf-8',
})

console.log(`check content:\n${content}`)

const lines = content.split('\n')

const asserts = [
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  'null',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  '"./conflux-rust/client/src/rpc/impls/cfx.rs"',
  'null',
  '"./conflux-rust/primitives/src/transaction.rs"',
  '"./conflux-rust/primitives/src/transaction.rs"',
  '"./conflux-rust/primitives/src/transaction.rs"',
  '"./conflux-rust/primitives/src/transaction.rs"',
  '"./conflux-rust/core/src/verification.rs"',
  '"./conflux-rust/core/src/verification.rs"',
  '"./conflux-rust/core/src/verification.rs"',
  '"./conflux-rust/core/src/executive/executive.rs"',
  '"./conflux-rust/core/src/executive/executive.rs"',
  '"./conflux-rust/core/src/executive/executive.rs"',
  '"./conflux-rust/core/src/executive/executed.rs"',
  '"./conflux-rust/core/src/executive/executed.rs"',
  '"./conflux-rust/core/src/executive/executed.rs"',
  'null',
  '"./conflux-rust/core/src/transaction_pool/mod.rs"',
  '"./conflux-rust/core/src/transaction_pool/mod.rs"',
  '"./conflux-rust/core/src/transaction_pool/mod.rs"',
  'null',
  '"./conflux-rust/core/src/transaction_pool/transaction_pool_inner.rs"',
  '"./conflux-rust/core/src/transaction_pool/transaction_pool_inner.rs"',
  '"./conflux-rust/core/src/transaction_pool/transaction_pool_inner.rs"',
  '"./conflux-rust/core/src/transaction_pool/transaction_pool_inner.rs"',
  'null',
]

lines.forEach((l, idx) => {
  console.log(`expect line ${idx + 1} to be ${asserts[idx]}`)
  strictEqual(
    l,
    asserts[idx],
    `expect line ${idx + 1} to be ${asserts[idx]}, found line ${
      idx + 1
    } is\n${l}`,
  )
})
