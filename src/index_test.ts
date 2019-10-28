import "mocha"
import { assert } from "chai"

import { } from "./index"
import { networks } from "./Network"

describe("hello", () => {
  it("says hello world", () => {
    assert.equal("hello world", "hello world")
  })
})

describe("Address Decoding", () => {
  it("Decoding a test address...", () => {
    const network = networks.mainnet
    const privateKey = "L3royRxpg1F4UVNieDfwaVuVGxoAd3Vp6eN7w3puap3vXU9JNa6P"

    const wallet = network.fromWIF(privateKey)
    console.log("public address:", wallet.address)

    assert.equal(wallet.address, "SRoinb4dd2M63T8qHdPd9iN9e2TkcitgTQ")
  })
})

describe("Network test", () => {
  it("Getting network status...", () => {
    const network = networks.mainnet

    network.insight().getStatus().then(result => {
      assert.isNotNull(result)
      console.log("network status:\n", result.info)
    }).catch(reason => {
      console.log(reason)
    })
  })
})

// describe("Address Balance test", () => {
//   it("Getting wallet balance...", () => {
//     const network = networks.mainnet

//     network.insight().getInfo("SRoinb4dd2M63T8qHdPd9iN9e2TkcitgTQ").then(result => {
//       assert.isNotNull(result)
//       console.log('address: ' + result.addStr + ', balance: ' + result.balance)
//     }).catch(reason => {
//       console.log(reason)
//     })
//   })
// })
