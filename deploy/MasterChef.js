module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const sushi = await ethers.getContract("SushiToken")
  
  const startBlock = 3329729
  const endBlock = startBlock + 1 // effectively eliminate this
  const rewardBlocks = [2827620+startBlock, 5655240+startBlock, 8482860+startBlock, 11310480+startBlock, 14138100+startBlock, 16965720+startBlock]
  const rewards = [9549, 4244, 1273, 354, 124, 88]
  const { address } = await deploy("MasterChef", {
    from: deployer,
    args: [sushi.address, dev, startBlock, endBlock, 
    rewardBlocks,
    rewards],
    log: true,
    deterministicDeployment: false
  })
  
  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const chainId = await getChainId();
  if((chainId === "31337" || chainId === "10001") && await sushi.owner() == deployer.address) {
    await (await sushi.mint(dev, 10000000000, txOptions)).wait()
  }

  // if (await sushi.owner() !== address) {
  //   // Transfer Sushi Ownership to Chef
  //   console.log("Transfer Sushi Ownership to Chef")
  //   await (await sushi.transferOwnership(address, txOptions)).wait()
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
