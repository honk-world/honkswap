// const { HONK_ADDRESS } = require("@honkswapdex/sdk");
const { HONK_ADDRESS } = require("../../honkswap-sdk/dist/index.js");

module.exports = async function ({ ethers, deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const chainId = await getChainId()
  let honk;
  if (chainId === "31337") {
    honk = (await deployments.get("HONKMock"));  // mock this
  } else if (chainId in HONK_ADDRESS) {
    const HonkContract = await ethers.getContractFactory("HonkToken"); // lets see if we can fake this
    honk = await HonkContract.attach(HONK_ADDRESS[chainId]);  
  } else {
    throw Error("No HONK_ADDRESS!");
  }
  
  const startBlock = 989239
  const endBlock = startBlock + (15684 * 14) // 15684 is approx blocks per day
  const { address } = await deploy("MasterChef", {
    from: deployer,
    args: [honk.address, dev, "100000000000000000000", "0", endBlock],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
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
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "HonkToken"]
