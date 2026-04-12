import { Module } from '@nestjs/common';
import { WalletMembersService } from './wallet_members.service';
import { WalletMembersController } from './wallet_members.controller';

@Module({
  controllers: [WalletMembersController],
  providers: [WalletMembersService],
})
export class WalletMembersModule {}
