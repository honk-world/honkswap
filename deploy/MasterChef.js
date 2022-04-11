const { HONK_ADDRESS } = require("@honkswapdex/sdk");

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()
  const chainId = await getChainId()

  let rewardToken
  if((chainId === "31337" || chainId === "10001") && await rewardToken.owner() == deployer.address) {
    rewardToken = await ethers.getContract("SushiToken")
  } else {
    rewardToken = {}
    rewardToken.address = HONK_ADDRESS[chainId]
  }
  
  const startBlock = 3977413
  const endBlock = startBlock + 1 // effectively eliminate this
  const rewardBlocks = [471270+startBlock, 1413810+startBlock, 2827620+startBlock, 5655240+startBlock, 11310480+startBlock, 16965720+startBlock]
  const rewards = [954967, 424485, 127316, 35465, 12478, 8841]
  const { address } = await deploy("MasterChef", {
    from: deployer,
    args: [rewardToken.address, dev, startBlock, endBlock, 
    rewardBlocks,
    rewards],
    log: true,
    deterministicDeployment: false
  })
  
  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  if((chainId === "31337" || chainId === "10001") && await rewardToken.owner() == deployer.address) {
    await (await rewardToken.mint(dev, 10000000000, txOptions)).wait()
  }

  // if (await rewardToken.owner() !== address) {
  //   // Transfer Sushi Ownership to Chef
  //   console.log("Transfer Sushi Ownership to Chef")
  //   await (await rewardToken.transferOwnership(address, txOptions)).wait()
  // }

  const masterChef = await ethers.getContract("MasterChef")
  if (await masterChef.owner() !== dev) {
    // Transfer ownership of MasterChef to dev
    console.log("Transfer ownership of MasterChef to dev")
    await (await masterChef.transferOwnership(dev, txOptions)).wait()
  }
}

module.exports.tags = ["MasterChef"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiToken"]
