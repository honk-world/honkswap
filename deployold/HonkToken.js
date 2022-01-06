module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()

  await deploy("HonkToken", {
    from: deployer,
    log: true,
    deterministicDeployment: false
  })
}

module.exports.tags = ["HonkToken"]
module.exports.dependencies = ["UniswapV2Factory", "UniswapV2Router02"]