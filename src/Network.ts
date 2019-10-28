import {
  HDNode,
  ECPair,
  networks as deocoinjsNetworks,
  Network as deocoinjsNetwork
} from "deocoinjs-lib"
import * as bip39 from "bip39"
import { Wallet } from "./Wallet"
import { Insight } from "./Insight"

export class Network {
  constructor(public info: deocoinjsNetwork) {
  }

  /**
   * Restore a HD-wallet address from mnemonic & password
   *
   * @param mnemonic
   * @param password
   *
   */
  public fromMnemonic(
    mnemonic: string,
    password?: string,
  ): Wallet {
    // if (bip39.validateMnemonic(mnemonic) == false) return false
    const seedHex = bip39.mnemonicToSeedHex(mnemonic, password)
    const hdNode = HDNode.fromSeedHex(seedHex, this.info)
    const account = hdNode.deriveHardened(88).deriveHardened(0).deriveHardened(0)
    const keyPair = account.keyPair
    return new Wallet(keyPair, this.info)
  }

  /**
   * Restore 10 wallet addresses exported from deocoin's mobile clients. These
   * wallets are 10 sequential addresses rooted at the HD-wallet path
   * `m/88'/0'/0'` `m/88'/0'/1'` `m/88'/0'/2'`, and so on.
   *
   * @param mnemonic
   * @param network
   */
  public fromMobile(
    mnemonic: string,
  ): Wallet[] {
    const seedHex = bip39.mnemonicToSeedHex(mnemonic)
    const hdNode = HDNode.fromSeedHex(seedHex, this.info)
    const account = hdNode.deriveHardened(88).deriveHardened(0)
    const wallets: Wallet[] = []
    for (let i = 0; i < 10; i++) {
      const hdnode = account.deriveHardened(i)
      const wallet = new Wallet(hdnode.keyPair, this.info)

      wallets.push(wallet)
    }
    return wallets
  }

  /**
   * Restore wallet from private key specified in WIF format:
   *
   * See: https://en.bitcoin.it/wiki/Wallet_import_format
   *
   * @param wif
   */
  public fromWIF(
    wif: string,
  ): Wallet {
    const keyPair = ECPair.fromWIF(wif, this.info)
    return new Wallet(keyPair, this.info)
  }

  /**
   * Alias for `fromWIF`
   * @param wif
   */
  public fromPrivateKey(
    wif: string,
  ): Wallet {
    return this.fromWIF(wif)
  }

  public insight(): Insight {
    return Insight.forNetwork(this.info)
  }
}

const mainnet = new Network(deocoinjsNetworks.deocoin)
const testnet = new Network(deocoinjsNetworks.deocoin_testnet)

export const networks = {
  mainnet,
  testnet,
}
