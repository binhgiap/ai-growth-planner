import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { NftMint } from '@nft-cron/entities/nft-mint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, NftMint])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
