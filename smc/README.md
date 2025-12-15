# HederaHakathon - ERC721 NFT Contract

A Hardhat TypeScript project for deploying ERC721 NFT contracts on Hedera Network.

## Installation

```bash
npm install
```

## Project Structure

```
.
├── contracts/          # Smart contracts (Solidity)
│   └── HederaHakathon.sol
├── scripts/            # Deployment scripts
│   └── deploy.ts
├── test/               # Test files
│   └── HederaHakathon.test.ts
├── hardhat.config.ts   # Hardhat configuration
└── tsconfig.json       # TypeScript configuration
```

## Scripts

### Compile contracts
```bash
npm run compile
```

### Run tests
```bash
npm run test
```

### Deploy to localhost
```bash
# Terminal 1: Run Hardhat node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### Deploy to Hedera Testnet
```bash
npm run deploy:hedera
```

### Deploy to Hedera Mainnet
```bash
npm run deploy:hedera:mainnet
```

### Verify contract
```bash
npm run verify
```

**Note:** For Hedera networks, manual verification on Hashscan is required. See [VERIFY_HEDERA.md](./VERIFY_HEDERA.md) for details.

### Clean artifacts
```bash
npm run clean
```

## Contract

### HederaHakathon

An ERC721 NFT contract with the following features:
- **ERC721**: Standard NFT implementation
- **ERC721Pausable**: Ability to pause/unpause transfers
- **Ownable**: Access control for minting and pause functions
- **Safe Minting**: Only owner can mint NFTs
- **Auto-incrementing Token IDs**: Each mint gets a unique sequential token ID

**Contract Details:**
- Name: `HederaHakathon`
- Symbol: `GLT`
- Functions:
  - `safeMint(address to)`: Mint a new NFT to an address (owner only)
  - `pause()`: Pause all transfers (owner only)
  - `unpause()`: Unpause all transfers (owner only)

## Testing

Tests are written in TypeScript using Chai and Hardhat. Run tests:

```bash
npm run test
```

**Test Coverage:**
- ✅ Deployment tests (4 tests)
- ✅ Minting tests (6 tests)
- ✅ Token ownership tests (3 tests)
- ✅ Pause/Unpause tests (7 tests)
- ✅ ERC721 standard function tests (6 tests)

**Total: 26 test cases - all passing**

## Deployment

### Prerequisites

1. **Private Key**: Your wallet's private key
2. **HBAR**: Sufficient HBAR in your wallet for gas fees
   - Testnet: Get free HBAR from [Hedera Portal Faucet](https://portal.hedera.com/faucet)
   - Mainnet: Purchase HBAR

### Setup

1. Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_private_key_here
```

2. Deploy to Hedera Testnet:
```bash
npm run deploy:hedera
```

3. Deploy to Hedera Mainnet:
```bash
npm run deploy:hedera:mainnet
```

For detailed deployment instructions, see [DEPLOY.md](./DEPLOY.md)

## Contract Verification

After deploying, verify your contract on Hashscan for transparency. See [VERIFY_HEDERA.md](./VERIFY_HEDERA.md) for manual verification instructions.

**Note:** Hedera requires manual verification on Hashscan (not supported by Hardhat verify plugin like Ethereum).

## Network Configuration

### Hedera Testnet
- RPC URL: `https://testnet.hashio.io/api`
- Chain ID: `296`
- Block Explorer: [Hashscan Testnet](https://hashscan.io/testnet)

### Hedera Mainnet
- RPC URL: `https://mainnet.hashio.io/api`
- Chain ID: `295`
- Block Explorer: [Hashscan Mainnet](https://hashscan.io/mainnet)

## Dependencies

- **Hardhat**: Development environment for Ethereum/Hedera
- **OpenZeppelin Contracts**: Secure smart contract libraries
- **TypeScript**: Type safety
- **Ethers.js**: Ethereum/Hedera library

## Security Notes

1. **Never commit `.env` file** to Git
2. **Use a separate wallet** for deployment, not your main wallet
3. **Test on testnet** before deploying to mainnet
4. **Backup your private key** securely

## License

MIT
