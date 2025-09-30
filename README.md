# FHEVM Private Health Checker 🔒🏥

A revolutionary privacy-preserving health monitoring application built on **FHEVM (Fully Homomorphic Encryption Virtual Machine)**. This application enables secure health metric assessment without compromising user privacy.

## ✨ Features

### 🔐 **Complete Privacy Protection**
- **End-to-End Encryption**: All health data remains encrypted throughout the entire process
- **FHEVM Technology**: Leverages Zama's cutting-edge homomorphic encryption for secure computations
- **User-Controlled Decryption**: Only users can decrypt and view their health status results
- **No Data Exposure**: Health metrics are processed in encrypted form on the blockchain

### 📊 **Multi-Metric Health Assessment**
- **Blood Pressure** (mmHg): Systolic blood pressure monitoring
- **Heart Rate** (bpm): Cardiac rhythm analysis
- **Blood Glucose** (mg/dL): Fasting blood glucose levels
- **Body Temperature** (°C): Core body temperature tracking
- **Blood Oxygen** (%): Oxygen saturation monitoring

### 🏗️ **Technical Architecture**
- **Smart Contracts**: Solidity contracts deployed on Sepolia testnet
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Wallet Integration**: MetaMask and EIP-6963 compatible wallets
- **Static Export**: Ready for deployment to any static hosting service
- **Development Tools**: Hardhat for contract development and testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Neil-Sally/fhevm-health-checker.git
   cd fhevm-health-checker
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend && npm install

   # Install smart contract dependencies
   cd ../fhevm-hardhat-template && npm install
   ```

3. **Start local development**
   ```bash
   # Terminal 1: Start Hardhat node
   cd fhevm-hardhat-template
   npm run node

   # Terminal 2: Deploy contracts
   npm run deploy

   # Terminal 3: Start frontend
   cd ../frontend
   npm run dev
   ```

4. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Connect your MetaMask wallet
   - Start checking your health metrics privately!

## 🏥 How It Works

### Privacy-First Health Assessment
1. **Input Encryption**: Health data is encrypted in the browser before transmission
2. **Blockchain Processing**: Encrypted data is sent to FHEVM smart contracts
3. **Homomorphic Computation**: Health assessments are performed on encrypted data
4. **Encrypted Results**: Results remain encrypted on the blockchain
5. **User Decryption**: Users can choose to decrypt and view results locally

### Security Guarantees
- 🔒 **Zero-Knowledge Proofs**: Computations prove correctness without revealing data
- 🔒 **End-to-End Encryption**: Data encrypted from input to final result
- 🔒 **User Sovereignty**: Users control when and if to decrypt results
- 🔒 **Blockchain Immutability**: All operations are recorded on-chain

## 📋 Health Metrics & Ranges

| Metric | Unit | Normal Range | Low Threshold | High Threshold |
|--------|------|--------------|---------------|----------------|
| Blood Pressure | mmHg | 90-140 | <90 | >140 |
| Heart Rate | bpm | 60-100 | <60 | >100 |
| Blood Glucose | mg/dL | 70-100 | <70 | >100 |
| Body Temperature | °C (x10) | 360-375 | <360 | >375 |
| Blood Oxygen | % | 95-100 | <95 | >100 |

## 🛠️ Development

### Project Structure
```
fhevm-health-checker/
├── fhevm-hardhat-template/     # Smart contracts & Hardhat setup
│   ├── contracts/             # Solidity smart contracts
│   ├── test/                  # Contract tests
│   ├── tasks/                 # Hardhat tasks
│   └── deployments/           # Deployment artifacts
├── frontend/                  # Next.js frontend application
│   ├── app/                   # Next.js app router
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── fhevm/                 # FHEVM integration
│   └── abi/                   # Contract ABIs & addresses
└── docs/                      # Documentation
```

### Smart Contract Deployment

**Local Development:**
```bash
cd fhevm-hardhat-template
npm run node                    # Start local Hardhat node
npm run deploy                  # Deploy contracts locally
```

**Sepolia Testnet:**
```bash
# Set environment variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

### Contract Addresses

**Sepolia Testnet:**
- FHEHealthChecker: `0x703E3E3C2Defb83c4e55223bA0121C7E3E9eb30d`
- FHECounter: `0x3F0b47Bbf84ad4076D93cDb301c4642BD1BaDc82`

### Testing Contracts
```bash
# Run all tests
npm test

# Test specific contract
npx hardhat test test/FHEHealthChecker.ts

# Run health check tasks
npx hardhat --network localhost task:health-check --metric 0 --value 120
```

## 🔧 Configuration

### Environment Variables
```bash
# Hardhat configuration
MNEMONIC=your_mnemonic_phrase
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Frontend (optional)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/your_infura_key
```

### Network Configuration
The application supports multiple networks:
- **Hardhat** (local development)
- **Sepolia** (public testnet)
- **Mainnet** (production, future)

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Developer Portal](https://portal.zama.ai/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for the FHEVM technology
- **Ethereum Foundation** for the Sepolia testnet
- **Open-source community** for the amazing tools and libraries

## 📞 Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Neil-Sally/fhevm-health-checker/issues)
- **Email**: jamiriss924@gmail.com

---

**⚠️ Disclaimer**: This application is for demonstration purposes. Not intended for medical diagnosis or treatment. Always consult healthcare professionals for medical advice.**

---

Made with ❤️ and 🔒 privacy-first principles
