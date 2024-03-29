
import { ethers } from "hardhat";
import { expect } from "chai";
import { advanceBlockTo } from "./utilities"

describe("MasterChef", function () {
  before(async function () {
    this.signers = await ethers.getSigners()
    this.alice = this.signers[0]
    this.bob = this.signers[1]
    this.carol = this.signers[2]
    this.dev = this.signers[3]
    this.minter = this.signers[4]

    this.MasterChef = await ethers.getContractFactory("MasterChef")
    this.SushiToken = await ethers.getContractFactory("SushiToken")
    this.ERC20Mock = await ethers.getContractFactory("ERC20Mock", this.minter)
  })

  beforeEach(async function () {
    this.sushi = await this.SushiToken.deploy()
    await this.sushi.deployed()
  })

  it("should set correct state variables", async function () {
    this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "0", "1000",
    [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
    await this.chef.deployed()

    //not honk await this.sushi.transferOwnership(this.chef.address)

    const sushi = await this.chef.sushi()
    const devaddr = await this.chef.devaddr()
    const owner = await this.sushi.owner()

    expect(sushi).to.equal(this.sushi.address)
    expect(devaddr).to.equal(this.dev.address)
    //expect(owner).to.equal(this.chef.address)
  })

  it("should allow dev and only dev to update dev", async function () {
    this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "0", "1000",
    [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
    await this.chef.deployed()

    expect(await this.chef.devaddr()).to.equal(this.dev.address)

    await expect(this.chef.connect(this.bob).dev(this.bob.address, { from: this.bob.address })).to.be.revertedWith("dev: wut?")

    await this.chef.connect(this.dev).dev(this.bob.address, { from: this.dev.address })

    expect(await this.chef.devaddr()).to.equal(this.bob.address)

    await this.chef.connect(this.bob).dev(this.alice.address, { from: this.bob.address })

    expect(await this.chef.devaddr()).to.equal(this.alice.address)
  })

  

  context("With ERC/LP token added to the field", function () {
    beforeEach(async function () {
      this.lp = await this.ERC20Mock.deploy("LPToken", "LP", "10000000000")

      await this.lp.transfer(this.alice.address, "1000")

      await this.lp.transfer(this.bob.address, "1000")

      await this.lp.transfer(this.carol.address, "1000")

      this.lp2 = await this.ERC20Mock.deploy("LPToken2", "LP2", "10000000000")

      await this.lp2.transfer(this.alice.address, "1000")

      await this.lp2.transfer(this.bob.address, "1000")

      await this.lp2.transfer(this.carol.address, "1000")
    })

    it("should allow emergency withdraw", async function () {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "100", "1000",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()

      await this.chef.add("100", this.lp.address, true)

      await this.lp.connect(this.bob).approve(this.chef.address, "1000")

      await this.chef.connect(this.bob).deposit(0, "100")

      expect(await this.lp.balanceOf(this.bob.address)).to.equal("900")

      await this.chef.connect(this.bob).emergencyWithdraw(0)

      expect(await this.lp.balanceOf(this.bob.address)).to.equal("1000")
    })

    it("should give out SUSHIs only after farming time", async function () {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "100", "1000",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()

      //not honk await this.sushi.transferOwnership(this.chef.address)
      await this.sushi.mint(this.chef.address, "10000000000")

      await this.chef.add("100", this.lp.address, true)

      await this.lp.connect(this.bob).approve(this.chef.address, "1000")
      await this.chef.connect(this.bob).deposit(0, "100")
      await advanceBlockTo("89")

      await this.chef.connect(this.bob).deposit(0, "0") // block 90
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
      await advanceBlockTo("94")

      await this.chef.connect(this.bob).deposit(0, "0") // block 95
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
      await advanceBlockTo("99")

      await this.chef.connect(this.bob).deposit(0, "0") // block 100
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
      await advanceBlockTo("100")

      await this.chef.connect(this.bob).deposit(0, "0") // block 101
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("17680")

      await advanceBlockTo("104")
      await this.chef.connect(this.bob).deposit(0, "0") // block 105

      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("88400")
      //not honk expect(await this.sushi.balanceOf(this.dev.address)).to.equal("500")
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
    })

    it("should not distribute SUSHIs if no one deposit", async function () {
      // 100 per block farming rate starting at block 200 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "200", "1000",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()
      //not honk await this.sushi.transferOwnership(this.chef.address)
      await this.sushi.mint(this.chef.address, "10000000000")
      await this.chef.add("100", this.lp.address, true)
      await this.lp.connect(this.bob).approve(this.chef.address, "1000")
      await advanceBlockTo("199")
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      await advanceBlockTo("204")
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      await advanceBlockTo("209")
      await this.chef.connect(this.bob).deposit(0, "10") // block 210
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("0")
      expect(await this.lp.balanceOf(this.bob.address)).to.equal("990")
      await advanceBlockTo("219")
      await this.chef.connect(this.bob).withdraw(0, "10") // block 220
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("176800")
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("0")
      expect(await this.lp.balanceOf(this.bob.address)).to.equal("1000")
    })

    it("should distribute SUSHIs properly for each staker", async function () {
      // 100 per block farming rate starting at block 300 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "300", "1000",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()
      //not honk await this.sushi.transferOwnership(this.chef.address)
      await this.sushi.mint(this.chef.address, "10000000000")
      await this.chef.add("100", this.lp.address, true)
      await this.lp.connect(this.alice).approve(this.chef.address, "1000", {
        from: this.alice.address,
      })
      await this.lp.connect(this.bob).approve(this.chef.address, "1000", {
        from: this.bob.address,
      })
      await this.lp.connect(this.carol).approve(this.chef.address, "1000", {
        from: this.carol.address,
      })
      // Alice deposits 10 LPs at block 310
      await advanceBlockTo("309")
      await this.chef.connect(this.alice).deposit(0, "10", { from: this.alice.address })
      // Bob deposits 20 LPs at block 314
      await advanceBlockTo("313")
      await this.chef.connect(this.bob).deposit(0, "20", { from: this.bob.address })
      // Carol deposits 30 LPs at block 318
      await advanceBlockTo("317")
      await this.chef.connect(this.carol).deposit(0, "30", { from: this.carol.address })
      // Alice deposits 10 more LPs at block 320. At this point:
      //   Alice should have: 4*17680 + 4*1/3*17680 + 2*1/6*17680 = 5666
      //   MasterChef should have the remaining: 10000 - 5666 = 4334
      await advanceBlockTo("319")
      await this.chef.connect(this.alice).deposit(0, "10", { from: this.alice.address })
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      expect(await this.sushi.balanceOf(this.alice.address)).to.equal("100186")
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
      expect(await this.sushi.balanceOf(this.carol.address)).to.equal("0")
      expect(await this.sushi.balanceOf(this.chef.address)).to.equal("9999899814")
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("0")
      // Bob withdraws 5 LPs at block 330. At this point:
      //   Bob should have: 4*2/3*1000 + 2*2/6*1000 + 10*2/7*1000 = 6190
      await advanceBlockTo("329")
      await this.chef.connect(this.bob).withdraw(0, "5", { from: this.bob.address })
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      expect(await this.sushi.balanceOf(this.alice.address)).to.equal("100186")
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("109447")
      expect(await this.sushi.balanceOf(this.carol.address)).to.equal("0")
      expect(await this.sushi.balanceOf(this.chef.address)).to.equal("9999790367")
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("0")
      // Alice withdraws 20 LPs at block 340.
      // Bob withdraws 15 LPs at block 350.
      // Carol withdraws 30 LPs at block 360.
      await advanceBlockTo("339")
      await this.chef.connect(this.alice).withdraw(0, "20", { from: this.alice.address })
      await advanceBlockTo("349")
      await this.chef.connect(this.bob).withdraw(0, "15", { from: this.bob.address })
      await advanceBlockTo("359")
      await this.chef.connect(this.carol).withdraw(0, "30", { from: this.carol.address })
      expect(await this.sushi.totalSupply()).to.equal("10000000000")
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("0")
      // Alice should have: 5666 + 10*2/7*1000 + 10*2/6.5*1000 = 11600
      expect(await this.sushi.balanceOf(this.alice.address)).to.equal("205100")
      // Bob should have: 6190 + 10*1.5/6.5 * 1000 + 10*1.5/4.5*1000 = 11831
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("209181")
      // Carol should have: 2*3/6*1000 + 10*3/7*1000 + 10*3/6.5*1000 + 10*3/4.5*1000 + 10*1000 = 26568
      expect(await this.sushi.balanceOf(this.carol.address)).to.equal("469719")
      // All of them should have 1000 LPs back.
      expect(await this.lp.balanceOf(this.alice.address)).to.equal("1000")
      expect(await this.lp.balanceOf(this.bob.address)).to.equal("1000")
      expect(await this.lp.balanceOf(this.carol.address)).to.equal("1000")
    })

    it("should give proper SUSHIs allocation to each pool", async function () {
      // 100 per block farming rate starting at block 400 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "400", "1000",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      //not honk await this.sushi.transferOwnership(this.chef.address)
      await this.sushi.mint(this.chef.address, "10000000000")
      await this.lp.connect(this.alice).approve(this.chef.address, "1000", { from: this.alice.address })
      await this.lp2.connect(this.bob).approve(this.chef.address, "1000", { from: this.bob.address })
      // Add first LP to the pool with allocation 1
      await this.chef.add("10", this.lp.address, true)
      // Alice deposits 10 LPs at block 410
      await advanceBlockTo("409")
      await this.chef.connect(this.alice).deposit(0, "10", { from: this.alice.address })
      // Add LP2 to the pool with allocation 2 at block 420
      await advanceBlockTo("419")
      await this.chef.add("20", this.lp2.address, true)
      // Alice should have 10*1000 pending reward
      expect(await this.chef.pendingSushi(0, this.alice.address)).to.equal("176800")
      // Bob deposits 10 LP2s at block 425
      await advanceBlockTo("424")
      await this.chef.connect(this.bob).deposit(1, "5", { from: this.bob.address })
      // Alice should have 10000 + 5*1/3*1000 = 11666 pending reward
      expect(await this.chef.pendingSushi(0, this.alice.address)).to.equal("206266")
      await advanceBlockTo("430")
      // At block 430. Bob should get 5*2/3*1000 = 3333. Alice should get ~1666 more.
      expect(await this.chef.pendingSushi(0, this.alice.address)).to.equal("235733")
      expect(await this.chef.pendingSushi(1, this.bob.address)).to.equal("58933")
    })

    it("should stop giving bonus SUSHIs after the bonus period ends", async function () {
      // 100 per block farming rate starting at block 500 with bonus until block 600
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "500", "600",
      [10000, 0, 0, 0, 0, 0], [1768, 1061, 637, 382, 229, 137])
      //not honk await this.sushi.transferOwnership(this.chef.address)
      await this.sushi.mint(this.chef.address, "10000000000")
      await this.lp.connect(this.alice).approve(this.chef.address, "1000", { from: this.alice.address })
      await this.chef.add("1", this.lp.address, true)
      // Alice deposits 10 LPs at block 590
      await advanceBlockTo("589")
      await this.chef.connect(this.alice).deposit(0, "10", { from: this.alice.address })
      // At block 605, she should have 1000*10 + 100*5 = 10500 pending.
      await advanceBlockTo("605")
      expect(await this.chef.pendingSushi(0, this.alice.address)).to.equal("185640")
      // At block 606, Alice withdraws all pending rewards and should get 10600.
      await this.chef.connect(this.alice).deposit(0, "0", { from: this.alice.address })
      expect(await this.chef.pendingSushi(0, this.alice.address)).to.equal("0")
      expect(await this.sushi.balanceOf(this.alice.address)).to.equal("187408")
    })

    it("should change rewards at proper block", async function () {
      // 100 per block farming rate starting at block 100 with bonus until block 1000
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "200", "0",
      [300, 310, 320, 330, 340, 350], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()

      await this.sushi.mint(this.chef.address, "10000000000")

      await this.chef.add("1", this.lp.address, true)

      await this.lp.connect(this.bob).approve(this.chef.address, "1000")
      await advanceBlockTo("98")
      await this.chef.connect(this.bob).deposit(0, "100") // block 99
      await this.chef.connect(this.bob).deposit(0, "0") // block 100
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")

      await advanceBlockTo("200")
      await this.chef.connect(this.bob).deposit(0, "0") // block 201
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("1768")

      await advanceBlockTo("299")
      await this.chef.connect(this.bob).deposit(0, "0") // block 300
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("176800")

      await advanceBlockTo("309")
      await this.chef.connect(this.bob).deposit(0, "0") // block 310
      // 176800 + 10 * 1061
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("187410")
     
      await advanceBlockTo("319")
      await this.chef.connect(this.bob).deposit(0, "0") // block 320
      // 187410 + 10 * 637
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("193780")

      await advanceBlockTo("329")
      await this.chef.connect(this.bob).deposit(0, "0") // block 330
      await advanceBlockTo("339")
      await this.chef.connect(this.bob).deposit(0, "0") // block 340
      await advanceBlockTo("349")
      await this.chef.connect(this.bob).deposit(0, "0") // block 350
      // 193780 + 10 * (382, 229, 137)
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("201260")

      await advanceBlockTo("360")
      await this.chef.connect(this.bob).deposit(0, "0") // block 351
      // 12378 past reward range 
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("201260")
    })

    it("should not reward if balance is empty", async function () {
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "0", "0", 
      [100, 120, 140, 160, 180, 200], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()

      // await this.sushi.mint(this.chef.address, "10000000000")

      await this.chef.add("1", this.lp.address, true) // create farm?

      await this.lp.connect(this.bob).approve(this.chef.address, "1000")
      // console.log( await ethers.provider.getBlockNumber())
      // console.log( await ethers.provider.getBlockNumber())
      await advanceBlockTo("99")
      await this.chef.connect(this.bob).deposit(0, "100") // block 100

      await this.chef.connect(this.bob).deposit(0, "0") // block 101
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")

      await advanceBlockTo("282") //2827621")
      await this.chef.connect(this.bob).deposit(0, "0") // block 2827622
      expect(await this.sushi.balanceOf(this.bob.address)).to.equal("0")
    })

    it("should be able transfer reward token to dev", async function () {
      this.chef = await this.MasterChef.deploy(this.sushi.address, this.dev.address, "0", "0", 
      [100, 120, 140, 160, 180, 200], [1768, 1061, 637, 382, 229, 137])
      await this.chef.deployed()
  
      await this.sushi.mint(this.chef.address, "10000000000")
  
      await this.chef.connect(this.dev).devWithdraw(50)
  
      expect(await this.sushi.balanceOf(this.dev.address)).to.equal("50")
  
      // await expect(await this.chef.connect(this.bob).devWithdraw(38)).to.be.revertedWith("dev: wut?")
    })

    
  })
})
