import { Controller, Get, Param, Delete, UseGuards, UseFilters } from '@nestjs/common';
import { ExpenseSplitsService } from './expense_splits.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';


@Controller('expense-splits')
@ApiBearerAuth('access-token')
@ApiTags('ExpenseSplits')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
export class ExpenseSplitsController {
  constructor(private readonly expenseSplitsService: ExpenseSplitsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả khoản chia chưa thanh toán', description: 'Lấy danh sách tất cả các khoản chia chưa được thanh toán trong hệ thống' })
  findAll() {
    return this.expenseSplitsService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy khoản chia theo ID', description: 'Lấy thông tin chi tiết của một khoản chia theo ID'})
  findOne(@Param('id') id: string) {
    return this.expenseSplitsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Xoá khoản chia theo ID', description: 'Xoá một khoản chia theo ID, thực chất là đánh dấu khoản chia đó đã được thanh toán'})
  remove(@Param('id') id: string) {
    return this.expenseSplitsService.remove(id);
  }
}
