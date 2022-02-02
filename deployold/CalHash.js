module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy("CalHash", {
    from: deployer,
    log: true,
  })
}

module.exports.tags = ["Cal"]
module.exports.dependencies = ["UniswapV2Pair"]
