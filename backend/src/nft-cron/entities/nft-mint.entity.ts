import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '@users/entities/user.entity';
import { Goal } from '@goals/entities/goal.entity';

/**
 * NftMint acts as the single source of truth for all minted NFTs.
 *
 * It stores:
 * - On-chain references (tokenId, txHash, contractAddress)
 * - Off-chain metadata used at mint time (description, userInfo, completionTimestamp)
 *
 * This table is used for:
 * - Preventing double-minting for the same goal (unique constraint on goalId)
 * - Building the NFT holder leaderboard
 * - Enriching the user profile with NFT ownership data
 */
@Entity('nfts')
@Unique('UQ_nft_goal', ['goal'])
@Index('IDX_nft_user', ['user'])
export class NftMint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Relation to the user who owns this NFT.
   */
  @ManyToOne(() => User, (user) => user.nfts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Relation to the goal that triggered this NFT mint.
   */
  @ManyToOne(() => Goal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  /**
   * On-chain references
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  tokenId: string | null;

  @Column({ type: 'varchar', length: 255 })
  txHash: string;

  @Column({ type: 'varchar', length: 255 })
  contractAddress: string;

  /**
   * Metadata used during minting
   */
  @Column({ type: 'varchar', length: 500 })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  userInfo: string;

  /**
   * Goal completion timestamp (milliseconds since epoch) captured at mint time.
   */
  @Column({ type: 'bigint', nullable: true })
  completionTimestamp: string | null;

  /**
   * When the NFT was minted on-chain.
   */
  @Column({ type: 'timestamp', nullable: true })
  mintedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
