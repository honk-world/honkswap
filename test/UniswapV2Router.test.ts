
import { ethers } from "hardhat";
import { expect } from "chai";
import { advanceBlockTo } from "./utilities"

describe("UniswapV2Router", function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
    this.dev = this.signers[3]
    this.minter = this.signers[4]

    this.UniswapLib = await ethers.getContractFactory("UniswapV2Library")
    this.UniswapFactory = await ethers.getContractFactory("UniswapV2Factory")
    this.UniswapRouter = await ethers.getContractFactory("UniswapV2Router02")
    this.UniswapPair = await ethers.getContractFactory("UniswapV2Pair")
    this.HonkToken = await ethers.getContractFactory("HonkToken")
    this.ERC20Mock = await ethers.getContractFactory("ERC20Mock", this.minter)
  })

  beforeEach(async function () {
    this.factory = await this.UniswapFactory.deploy(this.minter.address)
    await this.factory.deployed()
    this.honk = await this.HonkToken.deploy()
    await this.honk.deployed()
  })

  it("should allow liquidity to be added", async function () {
    this.dummy1 = await this.ERC20Mock.deploy("DummyToken1", "DT1", "10000000000")
    this.dummy2 = await this.ERC20Mock.deploy("DummyToken2", "DT2", "10000000000")

    await this.dummy1.transfer(this.alice.address, "1000")
    await this.dummy2.transfer(this.alice.address, "1000")

    this.router = await this.UniswapRouter.deploy(this.factory.address, this.dummy1.address)
    await this.router.deployed()


    // addLiquidity(
    //   address tokenA,
    //   address tokenB,
    //   uint amountADesired,
    //   uint amountBDesired,
    //   uint amountAMin,
    //   uint amountBMin,
    //   address to,
    //   uint deadline

    const result = await this.router.addLiquidity(
      this.dummy1.address,
      this.dummy2.address,
      100,
      200,
      100,
      200,
      this.alice.address,
      10000000000
    )
    
    expect(result)

    // await expect(this.chef.connect(this.bob).dev(this.bob.address, { from: this.bob.address })).to.be.revertedWith("dev: wut?")

    // await this.chef.connect(this.dev).dev(this.bob.address, { from: this.dev.address })

    // expect(await this.chef.devaddr()).to.equal(this.bob.address)

    // await this.chef.connect(this.bob).dev(this.alice.address, { from: this.bob.address })

    // expect(await this.chef.devaddr()).to.equal(this.alice.address)
  })

  
})
