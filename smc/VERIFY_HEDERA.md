# Manual Contract Verification on Hashscan (Hedera)

This guide explains how to manually verify your HederaHakathon contract on Hashscan.

## Why Verify?

When a contract is not verified, Hashscan will show:
- **FILE: None** - No source code visible
- **OBTAINER: None** - Missing contract information
- **Source tab** will be empty
- Cannot read contract code

After verification, you will see:
- ✅ Full source code displayed
- ✅ Easy to read and interact with contract
- ✅ Increased transparency and trust

## Verification Process (Manual)

### Step 1: Access Contract on Hashscan

1. Go to your contract page on Hashscan:
   - **Testnet**: `https://hashscan.io/testnet/address/<YOUR_CONTRACT_ADDRESS>`
   - **Mainnet**: `https://hashscan.io/mainnet/address/<YOUR_CONTRACT_ADDRESS>`

2. Click the **"VERIFY"** button (on the right) or the **"Source"** tab

### Step 2: Upload Build-Info File

**For Hardhat projects, you only need to upload ONE file:**

The `build-info` JSON file from your artifacts:
```
artifacts/build-info/<hash>.json
```

**How to find the build-info file:**

1. After compiling, the build-info file is generated in `artifacts/build-info/`
2. Use the most recent file (from the same compile that deployed the contract)
3. The file name is a hash like: `a0694e424ce4f7d6a90dd6214240eb85.json`

**Important:** 
- Use the build-info file from the **same compile** that you used to deploy
- If you recompile after deployment, the hash will change
- The build-info file contains all source code and metadata needed

### Step 3: Enter Constructor Parameters

If your contract has constructor parameters, enter them:
- **initialOwner**: `<YOUR_DEPLOYER_ADDRESS>`

For HederaHakathon contract:
- Constructor takes one parameter: `address initialOwner`
- This is the address that deployed the contract (your deployer address)

### Step 4: Click VERIFY

After uploading the build-info file and entering constructor parameters, click the **"VERIFY"** button.

## Files Needed

### Build-Info JSON File (Required)

```
artifacts/build-info/<hash>.json
```

This single file contains:
- ✅ All source code (including OpenZeppelin dependencies)
- ✅ Compiler settings
- ✅ Metadata
- ✅ Bytecode information

**Note:** According to [Hedera documentation](https://docs.hedera.com/hedera/core-concepts/smart-contracts/verifying-smart-contracts-beta#hardhat-intermediate), Hardhat projects only need the build-info file for verification.

## Important Notes

- **Compiler version must match**: `0.8.27` (check in `hardhat.config.ts`)
- **Optimizer settings must match**: `enabled: true, runs: 200`
- **Constructor parameters must be exact**: Use the exact address that deployed
- **Use correct build-info**: From the same compile session that deployed

## After Successful Verification

You will see:
- ✅ **Source tab** displays full contract code
- ✅ Contract is marked as verified
- ✅ Users can read and understand the contract easily
- ✅ Can interact with contract through Hashscan UI
- ✅ Increased transparency for users

## Troubleshooting

### Verification Failed

1. **Check compiler version**: Must match `0.8.27`
2. **Check optimizer settings**: Must match your `hardhat.config.ts`
3. **Verify constructor parameters**: Must be exact
4. **Use correct build-info**: From the same compile that deployed

### Build-Info File Not Found

1. Run `npm run compile` to generate build-info files
2. Check `artifacts/build-info/` directory
3. Use the most recent file

### Already Verified

If contract is already verified, you don't need to verify again.

## Why Manual Verification?

Hedera uses its own Sourcify instance, which is different from Ethereum's Etherscan. Hardhat's verify plugin doesn't support Hedera networks (Chain ID 296/295) directly, so manual verification on Hashscan is required.

This process is straightforward and only takes 2-3 minutes!
