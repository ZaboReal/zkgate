import { ethers } from "hardhat";

async function main() {
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const address = await verifier.getAddress();
  console.log("Verifier deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});