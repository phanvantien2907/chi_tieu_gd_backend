import { PartialType } from '@nestjs/swagger';
import { CreateExpenseSplitDto } from './create-expense_split.dto';

export class UpdateExpenseSplitDto extends PartialType(CreateExpenseSplitDto) {}
