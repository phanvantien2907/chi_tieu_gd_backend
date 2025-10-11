import { Controller, Get, Param, UseGuards, UseFilters } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Controller('settlements')
@ApiBearerAuth('access-token')
@ApiTags('Settlements')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
export class SettlementsController {
  constructor(private readonly settlementsService: SettlementsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê khoản nợ', description: 'Lấy các thống kê cơ bản về khoản nợ, bao gồm tổng số tiền chưa thanh toán, đã thanh toán, số lượng khoản nợ chưa thanh toán và đã thanh toán, cũng như danh sách top chủ nợ và con nợ' })
  getStats() {
    return this.settlementsService.getStats();
  }

  @Get()
  @ApiOperation({summary: 'Lấy tất cả các khoản nợ trong hệ thống', description: 'Lấy danh sách tất cả các khoản nợ trong hệ thống'})
  findAll() {
    return this.settlementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy khoản nợ theo ID', description: 'Lấy thông tin chi tiết của một khoản nợ theo ID'})
  findOne(@Param('id') id: string) {
    return this.settlementsService.findOne(id);
  }


}
