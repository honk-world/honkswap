module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const sushi = await ethers.getContract("SushiToken")
  
  const startBlock = 989239
  const endBlock = startBlock + (15684 * 14) // 15684 is approx blocks per day
  const { address } = await deploy("MasterChef", {
    from: deployer,
    args: [sushi.address, dev, "100000000000000000000", "0", endBlock, 
    [2827620, 5655240, 8482860, 11310480, 14138100, 16965720],
    [1768, 1061, 637, 382, 229, 137]],
    log: true,
    deterministicDeployment: false
  })
  
  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const chainId = await getChainId();
  if(chainId === "31337" || chainId === "10001") {
    await (await sushi.mint(dev, 10000000000, txOptions)).wait()
  }

  if (await sushi.owner() !== address) {
    // Transfer Sushi Ownership to Chef
    console.log("Transfer Sushi Ownership to Chef")
    await (await sushi.transferOwnership(address, txOptions)).wait()
  }

  const masterChef = await ethers.getContract("MasterChef")
  if (await masterChef.owner() !== dev) {
    // Transfer ownership of MasterChef to dev
    console.log("Transfer ownership of MasterChef to dev")
    await (await masterChef.transferOwnership(dev, txOptions)).wait()
  }
}

module.exports.tags = ["MasterChef"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiToken"]
