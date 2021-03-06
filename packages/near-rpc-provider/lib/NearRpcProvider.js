import NodeProvider from '@liquality/node-provider'
import { addressToString } from '@liquality/utils'
import { normalizeTransactionObject } from '@liquality/near-utils'
import { NodeError } from '@liquality/errors'

import { providers, Account } from 'near-api-js'
import { get, isArray } from 'lodash'
import { BigNumber } from 'bignumber.js'

import { version } from '../package.json'

// TODO: remove when migrating to v14
global.URL = function (a, b) {
  return a
}

export default class NearRpcProvider extends NodeProvider {
  constructor (network) {
    super({
      baseURL: network.helperUrl,
      responseType: 'text',
      transformResponse: undefined
    })
    this._jsonRpc = new providers.JsonRpcProvider(network.nodeUrl)
    this._network = network
    this._usedAddressCache = {}
    this._accountsCache = {}
  }

  async sendRawTransaction (hash) {
    const result = await this._sendRawTransaction(hash)
    get(result, 'transaction.hash')
  }

  async getBlockByHash (blockHash, includeTx) {
    return this._getBlockById(blockHash, includeTx)
  }

  async getBlockByNumber (blockNumber, includeTx) {
    return this._getBlockById(blockNumber, includeTx)
  }

  async getBlockHeight (txHash) {
    const result = await this._rpc('block', txHash ? { blockId: txHash } : { finality: 'final' })
    return get(result, 'header.height')
  }

  async getTransactionByHash (txHash) {
    const currentHeight = await this.getBlockHeight()
    const args = txHash.split('_')
    const tx = await this._rpcQuery('tx', args)
    const blockNumber = await this.getBlockHeight(tx.transaction_outcome.block_hash)
    return normalizeTransactionObject({ ...tx, blockNumber }, currentHeight)
  }

  async getTransactionReceipt (txHash) {
    const args = txHash.split('_')
    const tx = await this._rpcQuery('EXPERIMENTAL_tx_status', args)
    const blockNumber = await this.getBlockHeight(tx.transaction_outcome.block_hash)
    return { ...tx, blockNumber }
  }

  async getGasPrice () {
    const result = await this._rpcQuery('gas_price', [null])
    return get(result, 'gas_price')
  }

  async getBalance (addresses) {
    try {
      if (!isArray(addresses)) {
        addresses = [addresses]
      }
      addresses = addresses.map(addressToString)

      const balance = await this.getAccount(addresses[0]).getAccountBalance()
      return new BigNumber(balance.available)
    } catch (err) {
      if (err.message && err.message.includes('does not exist while viewing')) {
        return new BigNumber(0)
      }
      throw err
    }
  }

  async isAddressUsed (address) {
    address = addressToString(address)

    if (this._usedAddressCache[address]) {
      return true
    }

    try {
      await this._rpc('query', {
        request_type: 'view_account',
        finality: 'final',
        account_id: address
      })
      this._usedAddressCache[address] = true
      return true
    } catch (err) {
      return false
    }
  }

  async generateBlock (numberOfBlocks) {
    return new Promise(resolve => setTimeout(resolve, numberOfBlocks * 10000))
  }

  getAccount (accountId, signer) {
    return new Account(
      {
        networkId: this._network.networkId,
        provider: this._jsonRpc,
        signer
      },
      accountId
    )
  }

  async getFees () {
    return {
      slow: {
        fee: 0.0001,
        wait: 1
      },
      average: {
        fee: 0.0001,
        wait: 1
      },
      fast: {
        fee: 0.0001,
        wait: 1
      }
    }
  }

  async _sendRawTransaction (hash) {
    return this._rpcQuery('broadcast_tx_commit', [hash])
  }

  async _getBlockById (blockId, includeTx) {
    const block = await this._rpc('block', { blockId })
    const blockHash = get(block, 'header.hash')

    if (includeTx && !block.transactions && isArray(block.chunks)) {
      const chunks = await Promise.all(block.chunks.map(c => this._rpc('chunk', c.chunk_hash)))

      const transactions = chunks.reduce((p, c) => {
        p.push(...c.transactions.map(t => normalizeTransactionObject({ ...t, block_hash: blockHash })))
        return p
      }, [])

      return { ...block, transactions }
    }

    return block
  }

  async _rpc (method, args) {
    try {
      const data = await this._jsonRpc[method](args)
      return data
    } catch (error) {
      throw new NodeError(`${error.type} ${error.message}` || error)
    }
  }

  async _rpcQuery (method, args) {
    try {
      const data = await this._jsonRpc.sendJsonRpc(method, args)
      return data
    } catch (error) {
      throw new NodeError(`${error.type} ${error.message}` || error)
    }
  }
}

NearRpcProvider.version = version
