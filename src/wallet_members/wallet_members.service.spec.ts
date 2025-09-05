import { Test, TestingModule } from '@nestjs/testing';
import { WalletMembersService } from './wallet_members.service';

describe('WalletMembersService', () => {
  let service: WalletMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletMembersService],
    }).compile();

    service = module.get<WalletMembersService>(WalletMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
