// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract FHEHealthChecker is SepoliaConfig {
    // Health status constants
    // 0: Normal, 1: Low, 2: High

    // Health metric types
    enum HealthMetric {
        BLOOD_PRESSURE,    // mmHg, systolic
        HEART_RATE,        // bpm
        BLOOD_GLUCOSE,     // mg/dL
        BODY_TEMPERATURE,  // Celsius * 10 (e.g., 36.5°C = 365)
        BLOOD_OXYGEN       // percentage
    }

    // Health ranges for different metrics
    // Blood Pressure (systolic): 90-140 mmHg
    uint32 private constant BP_NORMAL_MIN = 90;
    uint32 private constant BP_NORMAL_MAX = 140;

    // Heart Rate: 60-100 bpm
    uint32 private constant HR_NORMAL_MIN = 60;
    uint32 private constant HR_NORMAL_MAX = 100;

    // Blood Glucose (fasting): 70-100 mg/dL
    uint32 private constant BG_NORMAL_MIN = 70;
    uint32 private constant BG_NORMAL_MAX = 100;

    // Body Temperature: 36.0-37.5°C (stored as 360-375)
    uint32 private constant BT_NORMAL_MIN = 360;
    uint32 private constant BT_NORMAL_MAX = 375;

    // Blood Oxygen: 95-100%
    uint32 private constant BO_NORMAL_MIN = 95;
    uint32 private constant BO_NORMAL_MAX = 100;

    // Store encrypted health status for each user and metric
    mapping(address => mapping(uint8 => euint8)) private userHealthStatuses;

    event HealthCheckRequested(address indexed user, bytes32 requestId, uint8 metric);
    event HealthCheckResult(address indexed user, uint256 requestId, uint8 metric, uint8 status);
    event HealthStatusUpdated(address indexed user, uint8 metric);

    constructor() {
        // No need to pre-allow constants since we create them dynamically
    }

    /**
     * @dev Check blood pressure and store encrypted health status
     * @param bloodPressure Encrypted blood pressure value (systolic, mmHg)
     * @param inputProof ZK proof for the encrypted input
     */
    function checkBloodPressure(
        externalEuint32 bloodPressure,
        bytes calldata inputProof
    ) external {
        euint32 bp = FHE.fromExternal(bloodPressure, inputProof);
        euint8 status = FHE.select(
            FHE.lt(bp, FHE.asEuint32(BP_NORMAL_MIN)),
            FHE.asEuint8(1), // low
            FHE.select(
                FHE.gt(bp, FHE.asEuint32(BP_NORMAL_MAX)),
                FHE.asEuint8(2), // high
                FHE.asEuint8(0)  // normal
            )
        );

        userHealthStatuses[msg.sender][uint8(HealthMetric.BLOOD_PRESSURE)] = status;
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        emit HealthStatusUpdated(msg.sender, uint8(HealthMetric.BLOOD_PRESSURE));
    }

    /**
     * @dev Check heart rate and store encrypted health status
     * @param heartRate Encrypted heart rate value (bpm)
     * @param inputProof ZK proof for the encrypted input
     */
    function checkHeartRate(
        externalEuint32 heartRate,
        bytes calldata inputProof
    ) external {
        euint32 hr = FHE.fromExternal(heartRate, inputProof);
        euint8 status = FHE.select(
            FHE.lt(hr, FHE.asEuint32(HR_NORMAL_MIN)),
            FHE.asEuint8(1), // low
            FHE.select(
                FHE.gt(hr, FHE.asEuint32(HR_NORMAL_MAX)),
                FHE.asEuint8(2), // high
                FHE.asEuint8(0)  // normal
            )
        );

        userHealthStatuses[msg.sender][uint8(HealthMetric.HEART_RATE)] = status;
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        emit HealthStatusUpdated(msg.sender, uint8(HealthMetric.HEART_RATE));
    }

    /**
     * @dev Check blood glucose and store encrypted health status
     * @param bloodGlucose Encrypted blood glucose value (mg/dL, fasting)
     * @param inputProof ZK proof for the encrypted input
     */
    function checkBloodGlucose(
        externalEuint32 bloodGlucose,
        bytes calldata inputProof
    ) external {
        euint32 bg = FHE.fromExternal(bloodGlucose, inputProof);
        euint8 status = FHE.select(
            FHE.lt(bg, FHE.asEuint32(BG_NORMAL_MIN)),
            FHE.asEuint8(1), // low
            FHE.select(
                FHE.gt(bg, FHE.asEuint32(BG_NORMAL_MAX)),
                FHE.asEuint8(2), // high
                FHE.asEuint8(0)  // normal
            )
        );

        userHealthStatuses[msg.sender][uint8(HealthMetric.BLOOD_GLUCOSE)] = status;
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        emit HealthStatusUpdated(msg.sender, uint8(HealthMetric.BLOOD_GLUCOSE));
    }

    /**
     * @dev Check body temperature and store encrypted health status
     * @param bodyTemperature Encrypted body temperature value (Celsius * 10, e.g., 36.5°C = 365)
     * @param inputProof ZK proof for the encrypted input
     */
    function checkBodyTemperature(
        externalEuint32 bodyTemperature,
        bytes calldata inputProof
    ) external {
        euint32 bt = FHE.fromExternal(bodyTemperature, inputProof);
        euint8 status = FHE.select(
            FHE.lt(bt, FHE.asEuint32(BT_NORMAL_MIN)),
            FHE.asEuint8(1), // low
            FHE.select(
                FHE.gt(bt, FHE.asEuint32(BT_NORMAL_MAX)),
                FHE.asEuint8(2), // high
                FHE.asEuint8(0)  // normal
            )
        );

        userHealthStatuses[msg.sender][uint8(HealthMetric.BODY_TEMPERATURE)] = status;
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        emit HealthStatusUpdated(msg.sender, uint8(HealthMetric.BODY_TEMPERATURE));
    }

    /**
     * @dev Check blood oxygen saturation and store encrypted health status
     * @param bloodOxygen Encrypted blood oxygen saturation value (percentage)
     * @param inputProof ZK proof for the encrypted input
     */
    function checkBloodOxygen(
        externalEuint32 bloodOxygen,
        bytes calldata inputProof
    ) external {
        euint32 bo = FHE.fromExternal(bloodOxygen, inputProof);
        euint8 status = FHE.select(
            FHE.lt(bo, FHE.asEuint32(BO_NORMAL_MIN)),
            FHE.asEuint8(1), // low
            FHE.select(
                FHE.gt(bo, FHE.asEuint32(BO_NORMAL_MAX)),
                FHE.asEuint8(2), // high
                FHE.asEuint8(0)  // normal
            )
        );

        userHealthStatuses[msg.sender][uint8(HealthMetric.BLOOD_OXYGEN)] = status;
        FHE.allowThis(status);
        FHE.allow(status, msg.sender);
        emit HealthStatusUpdated(msg.sender, uint8(HealthMetric.BLOOD_OXYGEN));
    }

    /**
     * @dev Get the user's encrypted health status for a specific metric
     * @param metric The health metric to query
     * @return Encrypted health status (0=normal, 1=low, 2=high)
     */
    function getHealthStatus(uint8 metric) external view returns (euint8) {
        return userHealthStatuses[msg.sender][metric];
    }


    /**
     * @dev Get the expected ranges for all health metrics
     * Returns arrays: [metricTypes[], mins[], maxs[], units[], descriptions[]]
     */
    function getHealthMetricRanges() external pure returns (
        uint8[] memory metricTypes,
        uint32[] memory mins,
        uint32[] memory maxs,
        string[] memory units,
        string[] memory descriptions
    ) {
        uint8[] memory types = new uint8[](5);
        uint32[] memory minimums = new uint32[](5);
        uint32[] memory maximums = new uint32[](5);
        string[] memory unitStrings = new string[](5);
        string[] memory descStrings = new string[](5);

        // Blood Pressure
        types[0] = uint8(HealthMetric.BLOOD_PRESSURE);
        minimums[0] = BP_NORMAL_MIN;
        maximums[0] = BP_NORMAL_MAX;
        unitStrings[0] = "mmHg";
        descStrings[0] = "Systolic Blood Pressure";

        // Heart Rate
        types[1] = uint8(HealthMetric.HEART_RATE);
        minimums[1] = HR_NORMAL_MIN;
        maximums[1] = HR_NORMAL_MAX;
        unitStrings[1] = "bpm";
        descStrings[1] = "Heart Rate";

        // Blood Glucose
        types[2] = uint8(HealthMetric.BLOOD_GLUCOSE);
        minimums[2] = BG_NORMAL_MIN;
        maximums[2] = BG_NORMAL_MAX;
        unitStrings[2] = "mg/dL";
        descStrings[2] = "Fasting Blood Glucose";

        // Body Temperature
        types[3] = uint8(HealthMetric.BODY_TEMPERATURE);
        minimums[3] = BT_NORMAL_MIN;
        maximums[3] = BT_NORMAL_MAX;
        unitStrings[3] = "Celsius (x10)";
        descStrings[3] = "Body Temperature (multiplied by 10)";

        // Blood Oxygen
        types[4] = uint8(HealthMetric.BLOOD_OXYGEN);
        minimums[4] = BO_NORMAL_MIN;
        maximums[4] = BO_NORMAL_MAX;
        unitStrings[4] = "%";
        descStrings[4] = "Blood Oxygen Saturation";

        return (types, minimums, maximums, unitStrings, descStrings);
    }

    /**
     * @dev Get the expected blood pressure ranges for UI display (backward compatibility)
     */
    function getBloodPressureRanges() external pure returns (uint32 min, uint32 max) {
        return (BP_NORMAL_MIN, BP_NORMAL_MAX);
    }
}
