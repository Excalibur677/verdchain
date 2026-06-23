const hre = require("hardhat");

async function main() {
  const [deployer, guardianPool, ecosystemFund, insurancePool] = await hre.ethers.getSigners();

  console.log("Deploying VerdChain with account:", deployer.address);

  const VerdChain = await hre.ethers.getContractFactory("VerdChain");
  const verdchain = await VerdChain.deploy(
    guardianPool.address,
    ecosystemFund.address,
    insurancePool.address
  );

  await verdchain.waitForDeployment();

  const address = await verdchain.getAddress();
  console.log("VerdChain deployed to:", address);
  console.log("Guardian Pool:", guardianPool.address);
  console.log("Ecosystem Fund:", ecosystemFund.address);
  console.log("Insurance Pool:", insurancePool.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});