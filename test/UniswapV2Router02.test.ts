import { prepare, deploy, getBigNumber, createSLP } from "./utilities"
import { ethers } from "hardhat";
const { ethers: { constants: { MaxUint256 }}} = require("ethers")

describe("UniswapV2Router02", function () {
  before(async function () {
    await prepare(this, ["UniswapV2Router02", "ERC20Mock", "UniswapV2Factory", "UniswapV2Pair", "WETH9Mock"])

    this.SushiToken = await ethers.getContractFactory("ERC20Mock")
    this.WethToken = await ethers.getContractFactory("WETH9Mock")
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
  })

  beforeEach(async function () {

    this.sushi = await this.SushiToken.deploy("SUSHI", "SUSHI", "5000000000000000000")
    await this.sushi.deployed()

    this.weth = await this.WethToken.deploy()
    await this.weth.deployed()

    await deploy(this, [
      ["factory", this.UniswapV2Factory, [this.alice.address]],
    ])

    await deploy(this, [["router", this.UniswapV2Router02, [this.factory.address, this.weth.address]]])

    //await createSLP(this, "sushiEth", this.sushi, this.weth, getBigNumber(10))
  })

  describe("addLiquidityETH", function () {
    it("tests addLiquidityETH", async function () {

      const overrides = {
        gasLimit: 9500000
      }

      const sushiAmount = "1000000000000000";
      const WETHAmount = "1000000000000000";

      const CalHashCont = await ethers.getContractFactory("CalHash")
      const calHash = await CalHashCont.deploy();
      await calHash.deployed();
      console.log(await calHash.getInitHash())

      await this.sushi.approve(this.router.address, sushiAmount);

      const tx = await this.router.addLiquidityETH(
        this.sushi.address, 
        sushiAmount, 
        sushiAmount, 
        WETHAmount, 
        this.alice.address, 
        MaxUint256, 
        {
          ...overrides,
          value: WETHAmount
        }
      )

      const receipt = await tx.wait()
      //console.log(receipt)
      // console.log(receipt.events[0].args.desc)
      for (const ev of receipt.events) {
        console.log(ev?.args?.id.toString() + " " + ev?.args?.date.toString())  
      }
    })
  })
})