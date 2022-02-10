
// import { ethers } from "hardhat";
// import { expect } from "chai";
// import { advanceBlockTo } from "./utilities"

// describe("UniswapV2Router", function () {
//   before(async function () {
//     this.signers = await ethers.getSigners()
//     this.alice = this.signers[0]
//     this.bob = this.signers[1]
//     this.carol = this.signers[2]
//     this.dev = this.signers[3]
//     this.minter = this.signers[4]

//     this.UniswapLib = await ethers.getContractFactory("UniswapV2Library")
//     this.UniswapFactory = await ethers.getContractFactory("UniswapV2Factory")
//     this.UniswapRouter = await ethers.getContractFactory("UniswapV2Router02")
//     this.UniswapPair = await ethers.getContractFactory("UniswapV2Pair")
//     this.HonkToken = await ethers.getContractFactory("HonkToken")
//     this.ERC20Mock = await ethers.getContractFactory("ERC20Mock", this.minter)
//   })

//   beforeEach(async function () {
//     this.factory = await this.UniswapFactory.deploy(this.minter.address)
//     await this.factory.deployed()
//     this.honk = await this.HonkToken.deploy()
//     await this.honk.deployed()
//   })

//   it("should allow liquidity to be added", async function () {
//     this.dummy1 = await this.ERC20Mock.deploy("DummyToken1", "DT1", "10000000000")
//     this.dummy2 = await this.ERC20Mock.deploy("DummyToken2", "DT2", "10000000000")

//     console.log(`addy 1: ${this.dummy1.address}`)
//     console.log(`addy 2: ${this.dummy2.address}`)

//     await this.dummy1.transfer(this.alice.address, "1000000000")
//     await this.dummy2.transfer(this.alice.address, "1000000000")

//     this.router = await this.UniswapRouter.deploy(this.factory.address, this.dummy1.address)
//     await this.router.deployed()

//     await this.dummy1.connect(this.alice).approve(this.router.address, "1000000000", { from: this.alice.address }) // over approve
//     await this.dummy2.connect(this.alice).approve(this.router.address, "1000000000", { from: this.alice.address })

//     const result = await this.router.addLiquidity(
//       this.dummy1.address, // tokenA
//       this.dummy2.address, // tokenB
//       "1000000000", // amount A desired
//       "1000000000", // amount B desired
//       "500000000", // amount A min
//       "500000000", // amount B min
//       this.alice.address, // to
//       "10000000000" // deadline
//     )

//     // skip until I know how to handle ETH/WETH
//     // const result = await this.router.addLiquidityETH(
//     //   this.dummy2.address, // token
//     //   200, // amountTokenDesired
//     //   100, // amountTokenMin
//     //   100, // amountETHDesired
//     //   this.alice.address, // to
//     //   10000000000 // deadline
//     // )
    
//     expect(result)
//   })

  
// })


import { expect } from "chai";
import { prepare, deploy, getBigNumber, createSLP } from "./utilities"
const { ethers: { constants: { MaxUint256 }}} = require("ethers")

describe("UniswapV2Router02", function () {
  before(async function () {
    await prepare(this, ["UniswapV2Router02", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair", "WETH9Mock"])
  })

  beforeEach(async function () {
    await deploy(this, [
      ["sushi", this.ERC20Mock, ["SUSHI", "SUSHI", getBigNumber("5000000000000000000")]],
      // ["dai", this.ERC20Mock, ["DAI", "DAI", getBigNumber("10000000")]],
      // ["mic", this.ERC20Mock, ["MIC", "MIC", getBigNumber("10000000")]],
      // ["usdc", this.ERC20Mock, ["USDC", "USDC", getBigNumber("10000000")]],
      // ["weth", this.WETH9Mock, [getBigNumber("10000000")]],
      ["weth", this.WETH9Mock, [getBigNumber("54800000000000000")]],
      // ["strudel", this.ERC20Mock, ["$TRDL", "$TRDL", getBigNumber("10000000")]],

      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])

    await deploy(this, [["router", this.UniswapV2Router02, [this.factory.address, this.weth.address]]])

    await createSLP(this, "sushiEth", this.sushi, this.weth, getBigNumber(10))
    // await createSLP(this, "strudelEth", this.strudel, this.weth, getBigNumber(10))
    // await createSLP(this, "daiEth", this.dai, this.weth, getBigNumber(10))
    // await createSLP(this, "usdcEth", this.usdc, this.weth, getBigNumber(10))
    // await createSLP(this, "micUSDC", this.mic, this.usdc, getBigNumber(10))
    // await createSLP(this, "sushiUSDC", this.sushi, this.usdc, getBigNumber(10))
    // await createSLP(this, "daiUSDC", this.dai, this.usdc, getBigNumber(10))
    // await createSLP(this, "daiMIC", this.dai, this.mic, getBigNumber(10))
  })

  describe("addLiquidityETH", function () {
    it("tests addLiquidityETH", async function () {

      // // console.log("this.weth.constructor.name: ", this.weth.constructor.name);
      // console.log("this.weth: ", this.weth);

      // const weth2 = await this.WETH9Mock.deploy();
      // await weth2.deployed();

      // console.log("weth2: ", weth2);


      const overrides = {
        gasLimit: 9500000
      }

      // const sushiAmount = "813666000000000000";
      const sushiAmount = "1000000000000000";
      const WETHAmount = "1000000000000000";

      console.log("test addLiquidityETH this.router.address:   ", this.router.address);
      console.log("test addLiquidityETH this.sushi.address:    ", this.sushi.address);
      console.log("test addLiquidityETH this.weth.address:     ", this.weth.address);
      console.log("test addLiquidityETH this.sushiEth.address: ", this.sushiEth.address);
      console.log("test addLiquidityETH this.alice.address:    ", this.alice.address);
      console.log("test addLiquidityETH this.factory.address:  ", this.factory.address);

      console.log("test addLiquidityETH 1");
      await this.sushi.approve(this.router.address, sushiAmount);
      console.log("test addLiquidityETH 2");

      await this.router.addLiquidityETH(this.sushi.address, sushiAmount, sushiAmount, WETHAmount, this.alice.address, MaxUint256, {
        ...overrides,
        value: WETHAmount
      })

      console.log("test addLiquidityETH 3");
    })
  })
})
