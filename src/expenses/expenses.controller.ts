import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { RoleGuard } from 'src/guard/role.guard';

@Controller('expenses')
@ApiBearerAuth('access-token')
@ApiTags('Expenses')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
export class ExpensesController {
constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả chi tiêu', description: 'Lấy danh sách tất cả chi tiêu trong hệ thống' })
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy chi tiêu theo ID', description: 'Lấy thông tin chi tiết của một khoản chi tiêu theo ID'})
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Xóa chi tiêu theo ID', description: 'Xóa một khoản chi tiêu theo ID'})
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
