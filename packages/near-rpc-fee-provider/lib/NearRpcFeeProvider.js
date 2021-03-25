import Provider from '@liquality/provider'

import BigNumber from 'bignumber.js'

import { version } from '../package.json'

export default class NearRpcFeeProvider extends Provider {
  constructor (slowMultiplier = 1, averageMultiplier = 1.5, fastMultiplier = 2) {
    super()
    this._slowMultiplier = slowMultiplier
    this._averageMultiplier = averageMultiplier
    this._fastMultiplier = fastMultiplier
  }

  calculateFee (base, multiplier) {
    return BigNumber(base).times(BigNumber(multiplier)).toNumber()
  }

  async getFees () {
    // Gas Price is fixed here
    const baseGasPrice = 1
    return {
      slow: {
        fee: this.calculateFee(baseGasPrice, this._slowMultiplier)
      },
      average: {
        fee: this.calculateFee(baseGasPrice, this._averageMultiplier)
      },
      fast: {
        fee: this.calculateFee(baseGasPrice, this._fastMultiplier)
      }
    }
  }
}

NearRpcFeeProvider.version = version
