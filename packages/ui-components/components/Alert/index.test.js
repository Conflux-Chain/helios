/* eslint-disable jest/expect-expect */

import React from 'react'
import testLibrary from '@testing-library/react'
import {describe, expect} from '@jest/globals'
import Alert from './index.js'
const {render, screen} = testLibrary
describe('Alert', () => {
  it('xxx', () => {
    render(
      <Alert
        open={true}
        type="warning"
        closable={false}
        content="6666"
        width="w-full"
      />,
    )
    // eslint-disable-next-line testing-library/no-debug
    // screen.debug()
    expect(screen.getByText('6666')).toBeInTheDocument()
  })
})
