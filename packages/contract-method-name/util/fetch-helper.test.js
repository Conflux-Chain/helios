import {expect, describe, afterEach} from '@jest/globals'
import nock from 'nock'
import fetchHelper from './fetch-helper'

describe('Fetch Helper', () => {
  afterEach(() => {
    nock.cleanAll()
  })

  it('should get data when request succeed', async () => {
    nock('https://some.domain.root', {
      reqheaders: {
        accept: 'application/json',
        'accept-encoding': 'gzip,deflate,br',
        connection: 'close',
        'user-agent': 'node-fetch',
      },
    })
      .get('/price')
      .reply(200, '{"someData": 1}')

    const response = await fetchHelper('https://some.domain.root/price')
    expect(response).toStrictEqual({
      someData: 1,
    })
  })

  it('should get null when request failed', async () => {
    nock('https://some.domain.root', {
      accept: 'application/json',
      'accept-encoding': 'gzip,deflate,br',
      connection: 'close',
      'user-agent': 'node-fetch',
    })
      .get('/price')
      .reply(500, '{"someData": 1}')

    const response = await fetchHelper('https://some.domain.root/price')
    expect(response).toBeNull()
  })
})
