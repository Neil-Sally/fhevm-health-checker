import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with FHEHealthChecker Locally (--network localhost)
 * ================================================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the FHEHealthChecker contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the FHEHealthChecker contract
 *
 *   npx hardhat --network localhost task:health-check --bp 120
 *   npx hardhat --network localhost task:health-check --bp 85
 *   npx hardhat --network localhost task:health-check --bp 150
 *
 *
 * Tutorial: Deploy and Interact with FHEHealthChecker on Sepolia (--network sepolia)
 * ================================================================================
 *
 * 1. Deploy the FHEHealthChecker contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the FHEHealthChecker contract
 *
 *   npx hardhat --network sepolia task:health-check --bp 120
 *   npx hardhat --network sepolia task:health-check --bp 85
 *   npx hardhat --network sepolia task:health-check --bp 150
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:health-address
 *   - npx hardhat --network sepolia task:health-address
 */
task("task:health-address", "Prints the FHEHealthChecker address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const fheHealthChecker = await deployments.get("FHEHealthChecker");

  console.log("FHEHealthChecker address is " + fheHealthChecker.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:health-ranges
 *   - npx hardhat --network sepolia task:health-ranges
 */
task("task:health-ranges", "Prints all health metric ranges").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { ethers, deployments } = hre;

  const fheHealthChecker = await deployments.get("FHEHealthChecker");
  const fheHealthCheckerContract = await ethers.getContractAt("FHEHealthChecker", fheHealthChecker.address);

  const [metricTypes, mins, maxs, units, descriptions] = await fheHealthCheckerContract.getHealthMetricRanges();

  console.log("Health Metric Ranges:");
  console.log("====================");

  const metricNames = ["Blood Pressure", "Heart Rate", "Blood Glucose", "Body Temperature", "Blood Oxygen"];

  for (let i = 0; i < metricTypes.length; i++) {
    console.log(`${i + 1}. ${metricNames[i]} (${descriptions[i]})`);
    console.log(`   Range: ${mins[i]} - ${maxs[i]} ${units[i]}`);
    console.log("");
  }

  // Also show legacy blood pressure ranges for compatibility
  const bpRanges = await fheHealthCheckerContract.getBloodPressureRanges();
  console.log(`Legacy BP range: ${bpRanges.min} - ${bpRanges.max} mmHg`);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:health-check --metric 0 --value 120
 *   - npx hardhat --network sepolia task:health-check --metric 1 --value 75
 */
task("task:health-check", "Calls health check functions of FHEHealthChecker Contract")
  .addOptionalParam("address", "Optionally specify the FHEHealthChecker contract address")
  .addParam("metric", "The health metric type (0=BP, 1=HR, 2=BG, 3=Temp, 4=O2)")
  .addParam("value", "The health value to check")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const metricType = parseInt(taskArguments.metric);
    const value = parseInt(taskArguments.value);

    if (metricType < 0 || metricType > 4) {
      throw new Error(`Argument --metric must be between 0 and 4`);
    }

    const metricNames = ["Blood Pressure", "Heart Rate", "Blood Glucose", "Body Temperature", "Blood Oxygen"];
    const metricName = metricNames[metricType];

    await fhevm.initializeCLIApi();

    const FHEHealthCheckerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEHealthChecker");
    console.log(`FHEHealthChecker: ${FHEHealthCheckerDeployment.address}`);

    const signers = await ethers.getSigners();
    const fheHealthCheckerContract = await ethers.getContractAt("FHEHealthChecker", FHEHealthCheckerDeployment.address);

    // Encrypt the value
    const encryptedValue = await fhevm
      .createEncryptedInput(FHEHealthCheckerDeployment.address, signers[0].address)
      .add32(value)
      .encrypt();

    console.log(`Checking ${metricName}: ${value}`);

    // Call the appropriate health check function
    let tx;
    switch (metricType) {
      case 0:
        tx = await fheHealthCheckerContract
          .connect(signers[0])
          .checkBloodPressure(encryptedValue.handles[0], encryptedValue.inputProof);
        break;
      case 1:
        tx = await fheHealthCheckerContract
          .connect(signers[0])
          .checkHeartRate(encryptedValue.handles[0], encryptedValue.inputProof);
        break;
      case 2:
        tx = await fheHealthCheckerContract
          .connect(signers[0])
          .checkBloodGlucose(encryptedValue.handles[0], encryptedValue.inputProof);
        break;
      case 3:
        tx = await fheHealthCheckerContract
          .connect(signers[0])
          .checkBodyTemperature(encryptedValue.handles[0], encryptedValue.inputProof);
        break;
      case 4:
        tx = await fheHealthCheckerContract
          .connect(signers[0])
          .checkBloodOxygen(encryptedValue.handles[0], encryptedValue.inputProof);
        break;
      default:
        throw new Error("Invalid metric type");
    }

    console.log(`Wait for tx:${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    // Get the encrypted result for the specific metric
    const encryptedStatus = await fheHealthCheckerContract.getHealthStatus(metricType);
    console.log("Encrypted health status:", encryptedStatus);

    // Decrypt the result
    const clearStatus = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedStatus,
      FHEHealthCheckerDeployment.address,
      signers[0],
    );

    const statusNum = Number(clearStatus);
    let statusText;
    if (statusNum === 0) {
      statusText = "NORMAL";
    } else if (statusNum === 1) {
      statusText = "LOW";
    } else {
      statusText = "HIGH";
    }
    console.log(`Health status for ${metricName} (${value}): ${statusText} (${clearStatus})`);

    console.log(`FHEHealthChecker health check(${metricName}, ${value}) succeeded!`);
  });
