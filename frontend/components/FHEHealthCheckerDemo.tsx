"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useFHEHealthChecker, HealthStatus } from "@/hooks/useFHEHealthChecker";
import { errorNotDeployed } from "./ErrorNotDeployed";

// Health metric definitions
export interface HealthMetric {
  id: number;
  name: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  placeholder: string;
  icon: string;
}

export const HEALTH_METRICS: HealthMetric[] = [
  {
    id: 0,
    name: "Blood Pressure",
    description: "Systolic blood pressure",
    unit: "mmHg",
    min: 90,
    max: 140,
    placeholder: "120",
    icon: "🩸"
  },
  {
    id: 1,
    name: "Heart Rate",
    description: "Heart rate in beats per minute",
    unit: "bpm",
    min: 60,
    max: 100,
    placeholder: "75",
    icon: "❤️"
  },
  {
    id: 2,
    name: "Blood Glucose",
    description: "Fasting blood glucose level",
    unit: "mg/dL",
    min: 70,
    max: 100,
    placeholder: "85",
    icon: "🩸"
  },
  {
    id: 3,
    name: "Body Temperature",
    description: "Body temperature (multiplied by 10)",
    unit: "°C × 10",
    min: 360,
    max: 375,
    placeholder: "365",
    icon: "🌡️"
  },
  {
    id: 4,
    name: "Blood Oxygen",
    description: "Blood oxygen saturation",
    unit: "%",
    min: 95,
    max: 100,
    placeholder: "98",
    icon: "💨"
  }
];

/*
 * Main FHEHealthChecker React component
 * - Input multiple health metric values
 * - Check health statuses using FHE operations
 * - Decrypt and display results
 */
export const FHEHealthCheckerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  //////////////////////////////////////////////////////////////////////////////
  // FHEVM instance
  //////////////////////////////////////////////////////////////////////////////

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  //////////////////////////////////////////////////////////////////////////////
  // useFHEHealthChecker
  //////////////////////////////////////////////////////////////////////////////

  const fheHealthChecker = useFHEHealthChecker({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  //////////////////////////////////////////////////////////////////////////////
  // UI State
  //////////////////////////////////////////////////////////////////////////////

  const [healthInputs, setHealthInputs] = useState<Record<number, string>>({});
  const [healthStatuses, setHealthStatuses] = useState<Record<number, HealthStatus>>({});
  const [selectedMetric, setSelectedMetric] = useState<number | null>(null);
  const [checkedMetrics, setCheckedMetrics] = useState<Record<number, boolean>>({});

  // Update health status when hook's healthStatus changes
  useEffect(() => {
    if (selectedMetric !== null && fheHealthChecker.healthStatus !== "unknown") {
      setHealthStatuses(prev => ({ ...prev, [selectedMetric]: fheHealthChecker.healthStatus }));
    }
  }, [fheHealthChecker.healthStatus, selectedMetric]);

  //////////////////////////////////////////////////////////////////////////////
  // Effects
  //////////////////////////////////////////////////////////////////////////////

  // Load health ranges on mount
  useEffect(() => {
    const loadRanges = async () => {
      if (!fheHealthChecker.contractAddress || !ethersReadonlyProvider) return;

      try {
        const contract = new ethers.Contract(
          fheHealthChecker.contractAddress,
          await import("@/abi/FHEHealthCheckerABI").then(m => m.FHEHealthCheckerABI.abi),
          ethersReadonlyProvider
        );

        const [metricTypes, mins, maxs, units, descriptions] = await contract.getHealthMetricRanges();
        console.log("✅ Successfully loaded health ranges from contract:", {
          metricTypes: metricTypes.map((t: bigint) => Number(t)),
          mins: mins.map((m: bigint) => Number(m)),
          maxs: maxs.map((m: bigint) => Number(m)),
          units,
          descriptions
        });

        // Update HEALTH_METRICS with actual ranges from contract
        // Note: In a real application, you might want to update the metrics dynamically
        // For now, we'll just verify the ranges match our expectations
      } catch (error) {
        console.error("Failed to load health ranges:", error);
      }
    };

    loadRanges();
  }, [fheHealthChecker.contractAddress, ethersReadonlyProvider]);

  //////////////////////////////////////////////////////////////////////////////
  // Handlers
  //////////////////////////////////////////////////////////////////////////////

  const handleInputChange = (metricId: number, value: string) => {
    setHealthInputs(prev => ({ ...prev, [metricId]: value }));
  };

  const handleCheckHealth = async (metric: HealthMetric) => {
    const value = parseInt(healthInputs[metric.id] || "0");
    if (!value || value <= 0) {
      setHealthStatuses(prev => ({ ...prev, [metric.id]: "unknown" }));
      return;
    }

    setSelectedMetric(metric.id);

    try {
      await fheHealthChecker.checkHealthMetric(metric.id, value);
      // Mark this metric as checked and store the encrypted status
      setCheckedMetrics(prev => ({ ...prev, [metric.id]: true }));
      // Store the encrypted status for this metric
      // Note: The hook currently stores it globally, but we'll work with that for now
      // Status will be updated by the hook when check completes
    } catch (error) {
      console.error("Health check failed:", error);
    }
  };

  const handleDecryptStatus = async (metricId: number) => {
    if (!fhevmInstance || !fheHealthChecker.contractAddress || !ethersSigner) {
      console.error("FHEVM instance, contract or signer not ready");
      return;
    }

    try {
      // Import ABI dynamically
      const { FHEHealthCheckerABI } = await import("@/abi/FHEHealthCheckerABI");

      // Get the encrypted status for this specific metric from the contract
      const readonlyContract = new ethers.Contract(
        fheHealthChecker.contractAddress,
        FHEHealthCheckerABI.abi,
        ethersReadonlyProvider
      );

      const encryptedResult = await readonlyContract.getHealthStatus(metricId);

      // Use FHEVM decryption signature
      const { FhevmDecryptionSignature } = await import("@/fhevm/FhevmDecryptionSignature");

      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevmInstance,
        [fheHealthChecker.contractAddress as `0x${string}`],
        ethersSigner,
        fhevmDecryptionSignatureStorage
      );

      if (!sig) {
        console.error("Unable to build FHEVM decryption signature");
        return;
      }

      // Decrypt using FHEVM instance with proper signature
      const res = await fhevmInstance.userDecrypt(
        [{ handle: encryptedResult, contractAddress: fheHealthChecker.contractAddress }],
        sig.privateKey,
        sig.publicKey,
        sig.signature,
        sig.contractAddresses,
        sig.userAddress,
        sig.startTimestamp,
        sig.durationDays
      );

      // Extract the decrypted value
      const clearStatus = res[encryptedResult];

      // Convert to number and map to status
      const statusNum = Number(clearStatus);
      let status: HealthStatus;
      if (statusNum === 0) {
        status = "normal";
      } else if (statusNum === 1) {
        status = "low";
      } else {
        status = "high";
      }

      // Update the status for this metric
      setHealthStatuses(prev => ({ ...prev, [metricId]: status }));

    } catch (error) {
      console.error("Health status decryption failed:", error);
    }
  };

  //////////////////////////////////////////////////////////////////////////////
  // UI Stuff
  //////////////////////////////////////////////////////////////////////////////

  const buttonClass =
    "inline-flex items-center justify-center rounded-xl bg-black px-4 py-3 font-semibold text-white shadow-sm " +
    "transition-colors duration-200 hover:bg-blue-700 active:bg-blue-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const inputClass =
    "block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6";

  const cardClass = "rounded-lg bg-white border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow";


  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "normal":
        return "✅";
      case "low":
        return "🔵";
      case "high":
        return "🔴";
      default:
        return "❓";
    }
  };

  const getStatusText = (status: HealthStatus) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "low":
        return "Low";
      case "high":
        return "High";
      default:
        return "Unknown";
    }
  };

  if (!isConnected) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-4xl">🏥</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">FHEVM Health Checker</h1>
        <p className="text-gray-600 mb-6">Connect your wallet to check your health metrics with complete privacy</p>
        <button
          className={buttonClass}
          onClick={connect}
        >
          <span className="text-lg px-6 py-3">Connect MetaMask</span>
        </button>
      </div>
    );
  }

  if (fheHealthChecker.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-4xl">🏥</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">FHEVM Health Checker</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          🔒 Private Health Threshold Check - Your health data stays encrypted throughout the entire process
        </p>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardClass}>
          <h3 className="font-semibold text-gray-800 mb-2">Chain Status</h3>
          <p className="text-sm text-gray-600">Chain ID: {chainId}</p>
          <p className="text-sm text-gray-600">
            Account: {accounts?.[0] ? `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}` : "Not connected"}
          </p>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold text-gray-800 mb-2">FHEVM Status</h3>
          <p className="text-sm text-gray-600">Status: {fhevmStatus}</p>
          <p className="text-sm text-gray-600">
            Instance: {fhevmInstance ? "✅ Ready" : "⏳ Loading"}
          </p>
        </div>

        <div className={cardClass}>
          <h3 className="font-semibold text-gray-800 mb-2">Contract</h3>
          <p className="text-sm text-gray-600">
            Health Checker: {fheHealthChecker.contractAddress ? "✅ Deployed" : "❌ Not deployed"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {fheHealthChecker.contractAddress?.slice(0, 10)}...{fheHealthChecker.contractAddress?.slice(-8)}
          </p>
        </div>
      </div>

      {/* Health Metrics Input */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Health Check Dashboard</h2>

        {/* Status Message */}
        {fheHealthChecker.message && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 font-medium">{fheHealthChecker.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HEALTH_METRICS.map((metric) => {
            const currentStatus = healthStatuses[metric.id] || "unknown";
            const inputValue = healthInputs[metric.id] || "";

            return (
              <div key={metric.id} className={`${cardClass} relative`}>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{metric.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{metric.name}</h3>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                </div>

                {/* Status Badge */}
                {currentStatus !== "unknown" && (
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentStatus)} mb-3`}>
                    <span className="mr-1">{getStatusIcon(currentStatus)}</span>
                    {getStatusText(currentStatus)}
                  </div>
                )}

                {/* Input */}
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      className={inputClass}
                      placeholder={metric.placeholder}
                      value={inputValue}
                      onChange={(e) => handleInputChange(metric.id, e.target.value)}
                      min={metric.min}
                      max={metric.max}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                      {metric.unit}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500">
                    Normal range: {metric.min} - {metric.max} {metric.unit}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      className={`${buttonClass} flex-1 text-sm py-2`}
                      disabled={!fhevmInstance || !inputValue || fheHealthChecker.isChecking}
                      onClick={() => handleCheckHealth(metric)}
                    >
                      {fheHealthChecker.isChecking && selectedMetric === metric.id ? "🔐 Checking..." : "🔐 Check"}
                    </button>

                    {checkedMetrics[metric.id] && currentStatus === "unknown" && (
                      <button
                        className={`${buttonClass} text-sm py-2 px-3 bg-green-600 hover:bg-green-700`}
                        disabled={fheHealthChecker.isDecrypting}
                        onClick={() => handleDecryptStatus(metric.id)}
                      >
                        {fheHealthChecker.isDecrypting ? "🔓 Decrypting..." : "🔓 Decrypt"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className={cardClass}>
        <h3 className="font-semibold text-gray-800 mb-4">📊 Health Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {HEALTH_METRICS.map((metric) => {
            const status = healthStatuses[metric.id] || "unknown";
            return (
              <div key={metric.id} className="text-center">
                <div className="text-2xl mb-1">{metric.icon}</div>
                <div className="text-xs text-gray-600 mb-1">{metric.name}</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                  <span className="mr-1">{getStatusIcon(status)}</span>
                  {getStatusText(status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-4">ℹ️ How FHEVM Privacy Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h4 className="font-medium">Encrypt Input</h4>
              <p>Your health values are encrypted in your browser before being sent to the blockchain</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h4 className="font-medium">Private Computation</h4>
              <p>The smart contract performs calculations on encrypted data without ever seeing your actual values</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h4 className="font-medium">Selective Disclosure</h4>
              <p>Only the classification result (normal/low/high) can be decrypted - your specific measurements remain private</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {fheHealthChecker.message && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{fheHealthChecker.message}</p>
        </div>
      )}
    </div>
  );
};

