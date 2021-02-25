import BitcoinNetworks from '../../packages/bitcoin-networks/lib'
import EthereumNetworks from '../../packages/ethereum-networks/lib'
import NearNetworks from '../../packages/near-networks/lib'

export default {
  bitcoin: {
    rpc: {
      host: 'http://localhost:18443',
      username: 'bitcoin',
      password: 'local321'
    },
    network: BitcoinNetworks.bitcoin_regtest,
    value: 1000000,
    mineBlocks: true
  },
  ethereum: {
    rpc: {
      host: 'http://localhost:8545'
    },
    value: 10000000000000000,
    network: {
      ...EthereumNetworks.local,
      name: 'mainnet',
      chainId: 1337, // Default geth dev mode - * Needs to be <= 255 for ledger * https://github.com/ethereum/go-ethereum/issues/21120
      networkId: 1337
    },
    metaMaskConnector: {
      port: 3333
    }
  },
  near: {
    network: NearNetworks.testnet,
    value: '5000000000000000000000000',

    // Both of the accounts are used for the tests.
    // liqualitysender is used as the initiator of the swaps.
    // liqualityreceiver is used as the recipient of the swaps.
    // Before each test all funds from the receiver are moved to the sender, which provides enough funds for the whole test suite.

    // liqualitysender
    mnemonic: 'engine monster galaxy obey lawsuit culture tool scan eternal math august humble',
    // liqualityreceiver
    receiverMnemonic: 'chicken concert congress gun language bottom invest powder gadget exile saddle menu'
  },
  // ethereum: { // RSK
  //   rpc: {
  //     host: 'http://localhost:4444'
  //   },
  //   value: 1000,
  //   network: EthereumNetworks.rsk_regtest,
  //   metaMaskConnector: {
  //     port: 3333
  //   }
  // },
  timeout: 240000 // No timeout
}
