
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const FHEHealthCheckerABI = {
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "requestId",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "metric",
          "type": "uint8"
        }
      ],
      "name": "HealthCheckRequested",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "metric",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "HealthCheckResult",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "metric",
          "type": "uint8"
        }
      ],
      "name": "HealthStatusUpdated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "bloodGlucose",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "checkBloodGlucose",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "bloodOxygen",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "checkBloodOxygen",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "bloodPressure",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "checkBloodPressure",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "bodyTemperature",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "checkBodyTemperature",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "externalEuint32",
          "name": "heartRate",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "inputProof",
          "type": "bytes"
        }
      ],
      "name": "checkHeartRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getBloodPressureRanges",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "min",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "max",
          "type": "uint32"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getHealthMetricRanges",
      "outputs": [
        {
          "internalType": "uint8[]",
          "name": "metricTypes",
          "type": "uint8[]"
        },
        {
          "internalType": "uint32[]",
          "name": "mins",
          "type": "uint32[]"
        },
        {
          "internalType": "uint32[]",
          "name": "maxs",
          "type": "uint32[]"
        },
        {
          "internalType": "string[]",
          "name": "units",
          "type": "string[]"
        },
        {
          "internalType": "string[]",
          "name": "descriptions",
          "type": "string[]"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "metric",
          "type": "uint8"
        }
      ],
      "name": "getHealthStatus",
      "outputs": [
        {
          "internalType": "euint8",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "protocolId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ]
} as const;

