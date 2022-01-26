const { WBCH } = require("@honkswapdex/sdk")
const { HONK_ADDRESS } = require("../../honkswap-sdk/dist/index.js");

module.exports = async function ({ ethers: { getNamedSigner }, getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer, dev } = await getNamedAccounts()

  const factory = await ethers.getContract("UniswapV2Factory")
  const bar = await ethers.getContract("SushiBar")
  
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
  
  let wbchAddress;
  
  if (chainId === '31337') {
    wbchAddress = (await deployments.get("WETH9Mock")).address
  } else if (chainId in WBCH) {
    // console.log(`WBCH: ${JSON.stringify(WBCH)}`)
    wbchAddress = WBCH[chainId].address
  } else {
    throw Error("No WBCH!")
  }

  await deploy("SushiMaker", {
    from: deployer,
    args: [factory.address, bar.address, honk.address, wbchAddress],
    log: true,
    deterministicDeployment: false
  })

  const txOptions = {
    gasPrice: 1050000000,
    gasLimit: 5000000,
  }

  const maker = await ethers.getContract("SushiMaker")
  if (await maker.owner() !== dev) {
    console.log("Setting maker owner")
    await (await maker.transferOwnership(dev, true, false, txOptions)).wait()
  }
}

module.exports.tags = ["SushiMaker"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02", "SushiBar", "Honktoken"]
