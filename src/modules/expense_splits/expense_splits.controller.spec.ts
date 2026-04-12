import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseSplitsController } from './expense_splits.controller';
import { ExpenseSplitsService } from './expense_splits.service';

describe('ExpenseSplitsController', () => {
  let controller: ExpenseSplitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseSplitsController],
      providers: [ExpenseSplitsService],
    }).compile();

    controller = module.get<ExpenseSplitsController>(ExpenseSplitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
