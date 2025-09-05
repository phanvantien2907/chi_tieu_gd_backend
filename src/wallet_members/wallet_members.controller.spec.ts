import { Test, TestingModule } from '@nestjs/testing';
import { WalletMembersController } from './wallet_members.controller';
import { WalletMembersService } from './wallet_members.service';

describe('WalletMembersController', () => {
  let controller: WalletMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletMembersController],
      providers: [WalletMembersService],
    }).compile();

    controller = module.get<WalletMembersController>(WalletMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
