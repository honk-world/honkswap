const { HONK_ADDRESS } = require("../../honkswap-sdk/dist/index.js");

module.exports = async function ({ getNamedAccounts, deployments }) {

  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

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

  await deploy("SushiBar", {
    from: deployer,
    args: [honk.address],
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["SushiBar"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiToken"]