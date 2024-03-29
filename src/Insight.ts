import {
  networks as deocoinjsNetworks,
  Network as deocoinjsNetwork
} from "deocoinjs-lib"
import axios, { AxiosInstance } from "axios"

const INSIGHT_BASEURLS: { [key: string]: string } = {
  [deocoinjsNetworks.deocoin.name]: "http://zacanbot.hopto.org:3001/deocoin-insight-api",
  [deocoinjsNetworks.deocoin_testnet.name]: "https://localhost:3001/deocoin-insight-api",
}

export class Insight {
  // public static mainnet(): Insight {
  //   return new Insight(MAINNET_API_BASEURL)
  // }

  // public static testnet(): Insight {
  //   return new Insight(TESTNET_API_BASEURL)
  // }

  public static forNetwork(network: deocoinjsNetwork): Insight {
    const baseURL = INSIGHT_BASEURLS[network.name]
    if (baseURL == null) {
      throw new Error(`No Insight API defined for network: ${network.name}`)
    }

    return new Insight(baseURL)
  }

  private axios: AxiosInstance

  constructor(private baseURL: string) {
    this.axios = axios.create({
      baseURL,
      // don't throw on non-200 response
      // validateStatus: () => true,
    })
  }

  public async listUTXOs(address: string): Promise<Insight.IUTXO[]> {
    const res = await this.axios.get(`/addr/${address}/utxo`)
    return res.data
  }

  public async getStatus(): Promise<Insight.IGetStatus> {
    const res = await this.axios.get(`/status`)
    return res.data
  }

  public async getInfo(address: string): Promise<Insight.IGetInfo> {
    const res = await this.axios.get(`/addr/${address}`)
    return res.data
  }

  public async sendRawTx(rawtx: string): Promise<Insight.ISendRawTxResult> {
    const res = await this.axios.post("/tx/send", {
      rawtx,
    })

    return res.data
  }

  public async contractCall(address: string, encodedData: string): Promise<Insight.IContractCall> {
    // FIXME wow, what a weird API design... maybe we should just host the RPC
    // server, with limited API exposed.
    const res = await this.axios.get(`/contracts/${address}/hash/${encodedData}/call`)

    return res.data
  }

  /**
   * Estimate the fee per KB of txdata, in satoshi. Returns -1 if no estimate is
   * available. It always return -1 for testnet.
   *
   * @param nblocks
   */
  public async estimateFee(nblocks: number = 6): Promise<any> {
    const res = await this.axios.get(`/utils/estimatefee?nbBlocks=${nblocks}`)

    const feeRate: number = res.data
    if (typeof feeRate !== "number" || feeRate < 0) {
      return -1
    }

    return Math.ceil(feeRate * 1e8)
  }

  /**
   * Estimate the fee per byte of txdata, in satoshi. Returns -1 if no estimate is
   * available. It always return -1 for testnet.
   *
   * @param nblocks
   */
  public async estimateFeePerByte(nblocks: number = 6): Promise<any> {
    const feeRate = await this.estimateFee()

    if (feeRate < 0) {
      return feeRate
    }

    return Math.ceil(feeRate / 1024)
  }
}

export namespace Insight {
  export type Foo = string

  export interface ISendRawTxResult {
    txid: string
  }

  export interface IUTXO {
    address: string
    txid: string
    vout: number

    /**
     * Public key that controls this UXTO, as hex string.
     */
    scriptPubKey: string

    amount: number
    satoshis: number

    isStake: boolean
    height: number
    confirmations: number
  }

  export interface IExecutionResult {
    gasUsed: number
    excepted: string
    newAddress: string
    output: string
    codeDeposit: number
    gasRefunded: number
    depositSize: number
    gasForDeposit: number
  }

  export interface ITransactionReceipt {
    stateRoot: string
    gasUsed: number
    bloom: string
    log: any[]
  }

  export interface IContractCall {
    address: string
    executionResult: any
  }

  export interface IGetInfo {
    addStr: string

    /**
     * balance of address in deocoin
     */
    balance: number

    /**
     * Balance of address in satoshi
     */
    balanceSat: number

    totalReceived: number
    totalReceivedSat: number
    totalSet: number
    totalSentSat: number

    unconfirmedBalance: number
    unconfirmedBalanceSat: number

    unconfirmedTxApperances: number
    txApperances: number

    /**
     * List of transaction IDs
     */
    transactions: string[]
  }

  export interface IGetStatus {
    info: string
  }
}
