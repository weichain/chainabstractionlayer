/* eslint-env mocha */

import chai, { expect } from 'chai'

import Client from '../../../client/lib'
import NearRpcFeeProvider from '../../lib'

chai.use(require('chai-bignumber')())
chai.config.truncateThreshold = 0

describe('NEAR RPC Fee provider', () => {
  let client

  beforeEach(() => {
    client = new Client()
    client.addProvider(new NearRpcFeeProvider(1, 1.5, 2))
  })

  describe('getFees', () => {
    it('Should return correct fees', async () => {
      const fees = await client.chain.getFees()
      expect(fees.slow.fee).to.equal(1)
      expect(fees.average.fee).to.equal(1.5)
      expect(fees.fast.fee).to.equal(2)
    })
  })
})
