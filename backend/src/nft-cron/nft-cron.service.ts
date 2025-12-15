import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ethers } from 'ethers';
import ABI from '@/abi/HederaHakathon.json';
import { Repository } from 'typeorm';
import { Goal } from '@goals/entities/goal.entity';
import { NftMint } from './entities/nft-mint.entity';

@Injectable()
export class NftCronService {
  private readonly logger = new Logger(NftCronService.name);

  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Signer;
  private readonly contract: ethers.Contract;
  private isRunning = false;

  private static readonly BATCH_SIZE = 100;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Goal)
    private readonly goalsRepository: Repository<Goal>,
    @InjectRepository(NftMint)
    private readonly nftMintRepository: Repository<NftMint>,
  ) {
    const rpcUrl =
      this.configService.get<string>('HEDERA_RPC_URL') ||
      'https://testnet.hashio.io/api';

    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const contractAddress = this.configService.get<string>(
      'SMART_CONTRACT_ADDRESS',
    );

    if (!privateKey || !contractAddress) {
      this.logger.error(
        'Missing PRIVATE_KEY or SMART_CONTRACT_ADDRESS in environment',
      );
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = privateKey
      ? new ethers.Wallet(privateKey, this.provider)
      : ethers.Wallet.createRandom().connect(this.provider);

    const abi = ABI;

    this.contract = new ethers.Contract(
      contractAddress ?? ethers.ZeroAddress,
      abi,
      this.wallet,
    );
  }

  @Cron('0 0 0 * * *')
  async handleCron() {
    // Guard against overlapping executions
    if (this.isRunning) {
      this.logger.warn('NFT cron job is already running, skipping this tick');
      return;
    }

    this.isRunning = true;
    try {
      await this.handleDailyMint();
    } finally {
      this.isRunning = false;
    }
  }

  async handleDailyMint(): Promise<{ totalMinted: number }> {
    const jobRawTarget = this.contract.target as string | undefined;
    const jobContractAddress = jobRawTarget ?? 'unknown';

    this.logger.log(
      `Starting daily NFT mint job. Contract=${jobContractAddress}, batchSize=${NftCronService.BATCH_SIZE}`,
    );

    let totalMinted = 0;
    // Process in fixed-size batches until there is no more work.
    // This ensures we can safely resume on next cron run in case of failures.
    for (;;) {
      const goals = await this.findCompletedNotMinted(
        NftCronService.BATCH_SIZE,
      );

      if (goals.length === 0) {
        break;
      }

      this.logger.log(`Found ${goals.length} goals to mint`);

      for (const goal of goals) {
        try {
          const minted = await this.mintAndPersist(goal, jobContractAddress);
          if (minted) {
            totalMinted += 1;
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            this.logger.error(
              `Failed to mint NFT for goal ${goal.id}: ${error.message}`,
              error.stack,
            );
          } else {
            this.logger.error(
              `Failed to mint NFT for goal ${goal.id}`,
              String(error),
            );
          }
        }
      }
    }

    const endRawTarget = this.contract.target as string | undefined;
    const endContractAddress = endRawTarget ?? 'unknown';

    this.logger.log(
      `Daily NFT mint job finished. Contract=${endContractAddress}, totalMinted=${totalMinted}`,
    );

    return { totalMinted };
  }

  /**
   * Query goals that are COMPLETED and have not yet been minted into NFTs.
   * Idempotency is guaranteed by checking the absence of a record in NftMint.
   */
  private async findCompletedNotMinted(limit: number): Promise<Goal[]> {
    const query = this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoinAndSelect('goal.user', 'user')
      .leftJoin(NftMint, 'nft', 'nft.goal_id = goal.id')
      .where('goal.status = :status', { status: 'COMPLETED' })
      .andWhere('goal.deletedAt IS NULL')
      .andWhere('nft.id IS NULL')
      .orderBy('goal.updatedAt', 'ASC')
      .addOrderBy('goal.id', 'ASC')
      .limit(limit);

    return query.getMany();
  }

  /**
   * Get count of completed goals that are pending NFT minting.
   * Useful for monitoring and testing.
   */
  async getPendingGoalsCount(): Promise<number> {
    const count = await this.goalsRepository
      .createQueryBuilder('goal')
      .leftJoin(NftMint, 'nft', 'nft.goal_id = goal.id')
      .where('goal.status = :status', { status: 'COMPLETED' })
      .andWhere('goal.deletedAt IS NULL')
      .andWhere('nft.id IS NULL')
      .getCount();

    return count;
  }

  /**
   * Mint an NFT for a single goal and persist the result in NftMint.
   * Returns true if minting succeeded and a record was created.
   */
  private async mintAndPersist(
    goal: Goal,
    contractAddress: string,
  ): Promise<boolean> {
    if (!goal.user) {
      this.logger.warn(
        `Skipping goal ${goal.id} because it has no associated user`,
      );
      return false;
    }

    const user = goal.user;

    if (!user.walletAddress) {
      this.logger.warn(
        `Skipping goal ${goal.id} for user ${user.id} because walletAddress is not set`,
      );
      return false;
    }

    if (!ethers.isAddress(user.walletAddress)) {
      this.logger.warn(
        `Skipping goal ${goal.id} for user ${user.id} because walletAddress is invalid: ${user.walletAddress}`,
      );
      return false;
    }

    const safeCurrentRole: string =
      typeof user.currentRole === 'string' ? user.currentRole : '';
    const userInfo =
      `${user.firstName}-${user.lastName}-${safeCurrentRole}`.replace(
        /\s+/g,
        '',
      );
    const description = goal.title;
    const completionTimestampMs =
      goal.updatedAt instanceof Date ? goal.updatedAt.getTime() : Date.now();

    this.logger.log(
      `Minting NFT for goal=${goal.id}, user=${user.id}, wallet=${user.walletAddress}`,
    );

    const tx = (await this.contract.safeMint(
      user.walletAddress,
      description,
      userInfo,
      BigInt(completionTimestampMs),
    )) as ethers.TransactionResponse;

    this.logger.log(
      `Mint transaction submitted for goal=${goal.id}: ${tx.hash}`,
    );

    const receipt = (await tx.wait()) as ethers.TransactionReceipt;

    // Try to parse tokenId from NFTMinted event, fallback to null
    let tokenId: string | null = null;
    try {
      for (const log of receipt.logs) {
        try {
          const parsed = this.contract.interface.parseLog(log);
          if (parsed && parsed.name === 'NFTMinted') {
            const rawTokenId = parsed.args?.tokenId;
            if (
              typeof rawTokenId === 'string' ||
              typeof rawTokenId === 'number' ||
              typeof rawTokenId === 'bigint'
            ) {
              tokenId = String(rawTokenId);
            }
            break;
          }
        } catch {
          // Ignore logs that don't match this contract
        }
      }
    } catch (err) {
      this.logger.warn(
        `Unable to parse NFTMinted event for tx=${receipt.hash}: ${String(
          err,
        )}`,
      );
    }

    const mintedAt = receipt.blockNumber
      ? await this.getBlockTimestampAsDate(receipt.blockNumber)
      : new Date();

    const nft = this.nftMintRepository.create({
      user,
      goal,
      tokenId,
      txHash: receipt.hash,
      contractAddress,
      description,
      userInfo,
      completionTimestamp: completionTimestampMs.toString(),
      mintedAt,
    });

    await this.nftMintRepository.save(nft);

    this.logger.log(
      `NFT minted and persisted for goal=${goal.id}, user=${user.id}, tokenId=${tokenId}, tx=${receipt.hash}`,
    );

    return true;
  }

  private async getBlockTimestampAsDate(
    blockNumber: number,
  ): Promise<Date | null> {
    try {
      const block = await this.provider.getBlock(blockNumber);
      if (!block || block.timestamp === undefined || block.timestamp === null) {
        return null;
      }
      return new Date(Number(block.timestamp) * 1000);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch block ${blockNumber} for timestamp: ${String(error)}`,
      );
      return null;
    }
  }
}
