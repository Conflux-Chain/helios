// This was ported from https://github.com/MaiaVictor/eth-lib, with some minor
// modifications to ESM module. It is licensed under MIT:
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

const generate = (num, fn) => {
  let a = []
  for (var i = 0; i < num; ++i) a.push(fn(i))
  return a
}

const replicate = (num, val) => generate(num, () => val)

const concat = (a, b) => a.concat(b)

const flatten = a => {
  let r = []
  for (let j = 0, J = a.length; j < J; ++j)
    for (let i = 0, I = a[j].length; i < I; ++i) r.push(a[j][i])
  return r
}

const chunksOf = (n, a) => {
  let b = []
  for (let i = 0, l = a.length; i < l; i += n) b.push(a.slice(i, i + n))
  return b
}

export {generate, replicate, concat, flatten, chunksOf}
