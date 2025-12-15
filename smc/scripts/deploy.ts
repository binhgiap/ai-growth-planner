import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy HederaHakathon contract
  const HederaHakathon = await ethers.getContractFactory("HederaHakathon");
  const initialOwner = deployer.address;

  console.log("\nDeploying HederaHakathon...");
  const hederaHakathon = await HederaHakathon.deploy(initialOwner);

  await hederaHakathon.waitForDeployment();

  const contractAddress = await hederaHakathon.getAddress();
  console.log("HederaHakathon deployed to:", contractAddress);

  // Get contract details
  const name = await hederaHakathon.name();
  const symbol = await hederaHakathon.symbol();
  const owner = await hederaHakathon.owner();
  
  console.log("\nContract Details:");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Owner:", owner);
  console.log("Contract Address:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

