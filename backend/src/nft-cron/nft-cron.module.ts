import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NftCronService } from './nft-cron.service';
import { NftCronController } from './nft-cron.controller';
import { NftMint } from './entities/nft-mint.entity';
import { Goal } from '@goals/entities/goal.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([NftMint, Goal])],
  providers: [NftCronService],
  controllers: [NftCronController],
})
export class NftCronModule {}
