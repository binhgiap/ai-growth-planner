# Deployment Guide for Hedera Network

This guide will help you deploy the HederaHakathon contract to Hedera Testnet or Mainnet.

## Prerequisites

### 1. Create `.env` file

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
```

**Getting your Private Key:**

**From MetaMask:**
- Open MetaMask
- Settings > Security & Privacy > Show Private Key
- Copy private key (remove `0x` prefix if present)

**Important:** Never share your private key!

### 2. Get HBAR for Gas Fees

**Hedera Testnet:**
- Get free HBAR from faucets:
  - [Hedera Portal Faucet](https://portal.hedera.com/faucet)
  - [Hedera Testnet Documentation](https://docs.hedera.com/hedera/getting-started/hedera-testnet/testnet-faucet)

**Hedera Mainnet:**
- Purchase HBAR from exchanges

## Network Configuration

### Hedera Testnet
- **RPC URL**: `https://testnet.hashio.io/api` (already configured)
- **Chain ID**: `296`
- **Currency**: HBAR
- **Block Explorer**: [Hashscan Testnet](https://hashscan.io/testnet)
- **No API Key Required**: Uses Hashio public RPC

### Hedera Mainnet
- **RPC URL**: `https://mainnet.hashio.io/api` (already configured)
- **Chain ID**: `295`
- **Currency**: HBAR
- **Block Explorer**: [Hashscan Mainnet](https://hashscan.io/mainnet)

## Deployment Steps

### Deploy to Hedera Testnet

```bash
npm run deploy:hedera
```

This will:
1. Connect to Hedera Testnet
2. Deploy the HederaHakathon contract
3. Display contract address and details

### Deploy to Hedera Mainnet

```bash
npm run deploy:hedera:mainnet
```

**⚠️ Warning:** Mainnet deployment uses real HBAR. Make sure you've tested on testnet first!

## After Deployment

After successful deployment, you will see:
- Contract address (EVM format: `0x...`)
- Contract name: `HederaHakathon`
- Symbol: `GLT`
- Owner address

### View on Hashscan

- **Testnet**: `https://hashscan.io/testnet/address/<CONTRACT_ADDRESS>`
- **Mainnet**: `https://hashscan.io/mainnet/address/<CONTRACT_ADDRESS>`

## Contract Verification

After deployment, verify your contract on Hashscan for transparency. See [VERIFY_HEDERA.md](./VERIFY_HEDERA.md) for detailed instructions.

**Note:** Hedera requires manual verification (not automated like Ethereum).

## Important Security Notes

1. **Never commit `.env` file** to Git (already in `.gitignore`)
2. **Test on testnet first** before deploying to mainnet
3. **Use a separate wallet** for deployment, not your main wallet
4. **Backup your private key** securely
5. **Check gas prices** before deploying

## Troubleshooting

### Error: "Insufficient funds"
- Make sure you have enough HBAR in your wallet
- For testnet, get HBAR from faucet

### Error: "Invalid private key"
- Check that your private key is correct in `.env`
- Private key can have or without `0x` prefix

### Error: "Network connection failed"
- Check your internet connection
- Verify RPC URL is accessible
