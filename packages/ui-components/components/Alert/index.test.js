/* eslint-disable jest/expect-expect */

import React from 'react'
import testLibrary from '@testing-library/react'
import {describe} from '@jest/globals'
import Alert from './index.js'
const {render} = testLibrary
console.log(render)
describe('Alert', () => {
  it('xxx', () => {
    const {container} = render(
      <Alert
        open={true}
        type="warning"
        closable={false}
        content="6666"
        width="w-full"
      />,
    )
    console.log('container', container)
  })
})
