# NFT Minting & Ownership Features – Final README

## 1. Overview
This document describes the **NFT minting and ownership system**, including:
- A **nightly cronjob** that mints NFTs for completed goals
- A **leaderboard API** that returns the top users holding the most NFTs
- An update to the existing **User Profile API** to return the user’s NFT list
- **NFT metadata enrichment** using ABI fields (`description`, `userInfo`)

The system is designed to be **stable, idempotent, and production-safe**.

---

## 2. Nightly NFT Minting Cronjob

### 2.1 Purpose
Automatically mint NFTs for goals that:
- Are marked as **COMPLETED**
- Have **not been minted before**

Each goal is minted **exactly once**.

---

### 2.2 Schedule
- **Time:** 00:00 (midnight)
- **Execution:** Cronjob / scheduled worker
- **Mode:** Sequential (no parallel minting)

---

### 2.3 High-Level Flow
1. Cronjob starts
2. Query completed, non-minted goals
3. Process goals in chunks of **100**
4. For each goal:
   - Build NFT metadata
   - Mint NFT
   - Persist mint result
5. Repeat until no records remain
6. Exit safely

---

### 2.4 Query Logic
```ts
findCompletedNotMinted(limit: number)
Conditions:

status = COMPLETED

No existing record in NftMint

Deterministic ordering (completedAt ASC or id ASC)

2.5 Batch Processing
Batch size: 100

const BATCH_SIZE = 100;

while (true) {
  const goals = await findCompletedNotMinted(BATCH_SIZE);
  if (goals.length === 0) break;

  for (const goal of goals) {
    await mintAndPersist(goal);
  }
}

2.6 Database: NftMint

Acts as single source of truth for minted NFTs

Prevents double minting

Enables ranking & analytics

Example fields:

id

goalId

userId

tokenId

txHash

contractAddress

mintedAt

createdAt

3. NFT Minting With ABI Metadata
3.1 ABI Requirements
The NFT smart contract ABI supports additional metadata fields:

description

userInfo

completionTimestamp

These fields must be populated at mint time.

3.2 Metadata Mapping Rules
description
Source: Goals.title

Meaning: Human-readable description of the achievement being minted

Example:

"Complete React Advanced Course"
userInfo
Source: Users table

Format:

{firstName}-{lastName}-{currentRole}
Fields used:

firstName
lastName
currentRole

Example:

John-Doe-FrontendEngineer

completionTimestamp

Fields used:
use updatedAt goals table and convert it to miliseconds. 

3.3 Metadata Construction Example
const userInfo = `${user.firstName}-${user.lastName}-${user.currentRole}`;
const description = goal.title;
3.4 Mint Call (Conceptual)
ts
safeMint({
  to: user.walletAddress,
  description,
  userInfo
});
4. Persist Mint Result (NftMint)
4.1 Purpose
Store mint results and metadata used during minting for auditability and API usage.

4.2 Fields
id

goalId (unique)

userId

tokenId

txHash

contractAddress

description

userInfo

mintedAt

createdAt

5. NFT Holder Leaderboard API
5.1 Endpoint
bash
GET /api/users/top-nft-holders
5.2 Query Logic
Group by userId

Count NFTs

Order by count DESC

Limit 10

5.3 Response Example
json
6. User Profile API (Updated)
6.1 Scope
The existing profile API is extended to return the list of NFTs owned by the user, including metadata.

6.2 Endpoint
bash
GET /api/users/:id/profile
6.3 New Field
nfts: array

6.4 NFT Object Shape
json
{
  "tokenId": "12345",
  "contractAddress": "0xabc...",
  "txHash": "0xdef...",
  "description": "Complete React Advanced Course",
  "userInfo": "John-Doe-FrontendEngineer",
  "mintedAt": "2025-12-15T00:12:03Z"
}
6.5 Data Source
NftMint table

Filter by userId

Order by mintedAt DESC

7. Idempotency & Safety
Unique constraint on goalId

Mint metadata is deterministic

Failed mint attempts are retried next cron run

No parallel execution

8. Performance Considerations
Index goalId, userId on NftMint

Chunk size fixed at 100

Profile NFT list can be paginated later if needed

9. Non-Goals
NFT transfer tracking

Manual mint triggers

10. Summary
Midnight cronjob mints NFTs safely and deterministically

ABI metadata (description, userInfo) is populated from DB

NftMint stores both on-chain references and off-chain metadata

Profile API returns full NFT list with metadata

System is intentionally boring and reliable