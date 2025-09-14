import { Module } from '@nestjs/common';
import { WalletTransactionsService } from './wallet_transactions.service';
import { WalletTransactionsController } from './wallet_transactions.controller';

@Module({
  controllers: [WalletTransactionsController],
  providers: [WalletTransactionsService],
})
export class WalletTransactionsModule {}
