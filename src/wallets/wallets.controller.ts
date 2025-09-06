import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseFilters, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import * as QRCode from 'qrcode';
import { Response } from 'express';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { RoleGuard } from 'src/guard/role.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@Controller('wallets')
@ApiBearerAuth('access-token')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
@ApiTags('Wallets')
export class WalletsController {
constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo ví mới', description: 'Tạo ví mới, mỗi ví tượng trưng cho một nhóm hoặc gia đình' })
  @ApiCreatedResponse({ description: 'Ví được tạo thành công', type: CreateWalletDto })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ hoặc tạo ví thất bại' })
 @ApiUnauthorizedResponse({ description: 'Người dùng chưa đăng nhập' })
  create(@Body() createWalletDto: CreateWalletDto) {
  return this.walletsService.create(createWalletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả ví', description: 'Lấy danh sách tất cả ví trong hệ thống' })
  @ApiOkResponse({ description: 'Lấy danh sách ví thành công' })
  findAll() {
    return this.walletsService.findAll();
  }

  @Get('join/:id/')
  @ApiOperation({ summary: 'Lấy QR code tham gia ví', description: 'Lấy ảnh QR code để tham gia ví để xem sau khi tạo' })
  @ApiOkResponse({ description: 'Lấy QR code thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy ví' })
  async getQr(@Param('id') id: string, @Res() res: Response) {
    const inviteUrl = `${process.env.SYSTEM_URL}/wallets/join/${id}`;
    const buffer = await QRCode.toBuffer(inviteUrl);
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
}

  @Get(':id')
  @ApiOperation({summary: 'Lấy thông tin ví theo ID', description: 'Lấy thông tin chi tiết của một ví theo ID'})
  @ApiOkResponse({ description: 'Lấy thông tin ví thành công' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy ví' })
  findOne(@Param('id') id: string) {
    return this.walletsService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({summary: 'Cập nhật thông tin ví theo ID', description: 'Cập nhật thông tin của một ví theo ID'})
  @ApiNotFoundResponse({ description: 'Không tìm thấy ví' })
  @ApiOkResponse({ description: 'Cập nhật thông tin ví thành công' })
  @ApiBadRequestResponse({ description: 'Dữ liệu không hợp lệ hoặc cập nhật ví thất bại' })
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
  return this.walletsService.update(id, updateWalletDto);
  }

  @Patch('delete/:id')
  @ApiOperation({summary: 'Xóa ví theo ID', description: 'Xóa một ví theo ID'})
  @ApiNotFoundResponse({ description: 'Không tìm thấy ví' })
  @ApiOkResponse({ description: 'Xóa ví thành công' })
  @ApiBadRequestResponse({ description: 'Xóa ví thất bại' })
  remove(@Param('id') id: string) {
  return this.walletsService.remove(id);
  }
}
