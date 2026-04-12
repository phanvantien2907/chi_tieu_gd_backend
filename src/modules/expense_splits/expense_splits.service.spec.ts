import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseSplitsService } from './expense_splits.service';

describe('ExpenseSplitsService', () => {
  let service: ExpenseSplitsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpenseSplitsService],
    }).compile();

    service = module.get<ExpenseSplitsService>(ExpenseSplitsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
