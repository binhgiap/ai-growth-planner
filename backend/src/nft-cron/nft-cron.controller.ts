import { Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { NftCronService } from './nft-cron.service';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('nft')
@Controller('nft')
export class NftCronController {
  constructor(private readonly nftCronService: NftCronService) {}

  @Post('mint')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger NFT minting job',
    description:
      'Triggers the NFT minting process for all completed goals that have not been minted yet. This is the same process that runs automatically at midnight via cron job.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mint job completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        totalMinted: { type: 'number' },
      },
    },
  })
  async mintNftOnce() {
    const result = await this.nftCronService.handleDailyMint();

    return {
      success: true,
      message: 'Mint job completed',
      totalMinted: result.totalMinted,
    };
  }

  @Get('pending-count')
  @ApiOperation({
    summary: 'Get count of goals pending NFT minting',
    description:
      'Returns the number of completed goals that are waiting to be minted as NFTs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        pendingCount: { type: 'number' },
      },
    },
  })
  async getPendingCount() {
    const count = await this.nftCronService.getPendingGoalsCount();

    return {
      success: true,
      pendingCount: count,
    };
  }
}
