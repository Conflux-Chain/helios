// This was ported from https://github.com/MaiaVictor/eth-lib, with some minor
// modifications to use ESM module and replace bn.js with big.js. It is licensed
// under MIT:
//
// Copyright 2017 Victor Maia
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import BN from 'bn.js'
import * as Bytes from '@cfxjs/bytes'

const fromBN = bn => '0x' + bn.toString('hex')

const toBN = str => new BN(str.slice(2), 16)

const fromString = str => {
  const bn =
    '0x' +
    (str.slice(0, 2) === '0x'
      ? new BN(str.slice(2), 16)
      : new BN(str, 10)
    ).toString('hex')
  return bn === '0x0' ? '0x' : bn
}

const toEther = wei => toNumber(div(wei, fromString('10000000000'))) / 100000000

const fromEther = eth =>
  mul(fromNumber(Math.floor(eth * 100000000)), fromString('10000000000'))

const toString = a => toBN(a).toString(10)

const fromNumber = a =>
  typeof a === 'string'
    ? /^0x/.test(a)
      ? a
      : '0x' + a
    : '0x' + new BN(a).toString('hex')

const toNumber = a => toBN(a).toNumber()

const toUint256 = a => Bytes.pad(32, a)

const bin = method => (a, b) => fromBN(toBN(a)[method](toBN(b)))

const add = bin('add')
const mul = bin('mul')
const div = bin('div')
const sub = bin('sub')

export {
  toString,
  fromString,
  toNumber,
  fromNumber,
  toEther,
  fromEther,
  toUint256,
  add,
  mul,
  div,
  sub,
}
