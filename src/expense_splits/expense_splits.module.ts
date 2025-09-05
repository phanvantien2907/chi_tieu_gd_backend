import { Module } from '@nestjs/common';
import { ExpenseSplitsService } from './expense_splits.service';
import { ExpenseSplitsController } from './expense_splits.controller';

@Module({
  controllers: [ExpenseSplitsController],
  providers: [ExpenseSplitsService],
})
export class ExpenseSplitsModule {}
