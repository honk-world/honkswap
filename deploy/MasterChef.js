const { HONK_ADDRESS } = require("../../honkswap-sdk/dist/index.js");

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()
  let honk;
  if (chainId === "31337") {
    honk = await ethers.getContract("HonkToken") 
  } else if (chainId in HONK_ADDRESS) {
    const HonkContract = await ethers.getContractFactory("HonkToken"); 
    honk = await HonkContract.attach(HONK_ADDRESS[chainId]);  
  } else {
    throw Error("No HONK_ADDRESS!");
  }

  // console.log(`honk: ${JSON.stringify(honk)}`)
  
  // this is the bonus period, going to skip it
  const honkPerBlock = "1455" // approx 25B in 3 years todo: make this early rewarded instead of linear
  const { address } = await deploy("MasterChef", {
    from: deployer,
    // _sushi, _devaddr, _sushiPerBlock, _startBlock, _bonusEndBlock // skip the bonus
    args: [honk.address, dev, honkPerBlock, "0", "1"],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const masterChef = await ethers.getContract("MasterChef")
  // // console.log(`${JSON.stringify(masterChef)}`)
  // console.log(`masterChef owner: ${JSON.stringify(await masterChef.owner())}`)

  // const timelock = await ethers.getContract("Timelock")
  // console.log(`timelock owner: ${JSON.stringify(await timelock.owner())}`)

  if (await masterChef.owner() !== dev) {
    // Transfer ownership of MasterChef to dev
    console.log("Transfer ownership of MasterChef to dev")
    // await (await masterChef.transferOwnership(dev, txOptions)).wait()
  }
}

module.exports.tags = ["MasterChef"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "HonkToken"]
