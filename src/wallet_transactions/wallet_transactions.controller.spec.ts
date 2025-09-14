import { Test, TestingModule } from '@nestjs/testing';
import { WalletTransactionsController } from './wallet_transactions.controller';
import { WalletTransactionsService } from './wallet_transactions.service';

describe('WalletTransactionsController', () => {
  let controller: WalletTransactionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletTransactionsController],
      providers: [WalletTransactionsService],
    }).compile();

    controller = module.get<WalletTransactionsController>(WalletTransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
