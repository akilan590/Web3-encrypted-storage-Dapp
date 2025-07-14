const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const Upload = await hre.ethers.getContractFactory("Upload");
  const upload = await Upload.deploy();
  
  console.log("Transaction hash:", upload.deploymentTransaction().hash);
  await upload.waitForDeployment();
  
  console.log("Contract deployed to:", await upload.getAddress());
  
  // Optional: Verify contract (if using Etherscan)
  // await hre.run("verify:verify", {
  //   address: await upload.getAddress(),
  //   constructorArguments: [],
  // });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});