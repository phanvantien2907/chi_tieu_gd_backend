import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, Catch, Req } from '@nestjs/common';
import { WalletMembersService } from './wallet_members.service';
import { CreateWalletMemberDto } from './dto/create-wallet_member.dto';
import { UpdateWalletMemberDto } from './dto/update-wallet_member.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { UpdateRoleWalletMemberDto } from 'src/wallet_members/dto/update_role_wallet_member.dto';

@Controller('wallet-members')
@ApiBearerAuth('access-token')
 @ApiTags('Wallet Members')
 @UseFilters(CatchEverythingFilter)
export class WalletMembersController {
  constructor(private readonly walletMembersService: WalletMembersService) {}

  @Post()
  @ApiOperation({ summary: 'Thêm thành viên vào ví', description: 'Thêm một người dùng vào ví với vai trò thành viên hoặc quản trị viên' })
  create(@Body() createWalletMemberDto: CreateWalletMemberDto) {
    return this.walletMembersService.create(createWalletMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả thành viên trong ví', description: 'Lấy danh sách tất cả thành viên trong tất cả các ví' })
  findAll() {
    return this.walletMembersService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy thông tin thành viên trong ví theo ID', description: 'Lấy thông tin chi tiết của một thành viên trong ví theo ID thành viên'})
  findOne(@Param('id') memberId: string) {
    return this.walletMembersService.findOne(memberId);
  }

  @Get('member-join-wallets/:id')
  @ApiOperation({summary: 'Lấy thông tin thành viên tham gia ví theo ID', description: 'Lấy thông tin chi tiết của một thành viên xem thành viên đó đang tham gia ví nào'})
  findMemberJoinWallets(@Param('id') userId: string) {
    return this.walletMembersService.findMemberWallet(userId);
  }

  @Patch('update/role/:id')
  @ApiOperation({summary: 'Cập nhật vai trò thành viên trong ví', description: 'Cập nhật vai trò của một thành viên trong ví, chỉ quản trị viên mới có quyền thực hiện hành động này'})
  updateRole(@Param('id') memberId: string, @Body() updateRoleWalletMemberDto: UpdateRoleWalletMemberDto) {
  return this.walletMembersService.updateRole(memberId, updateRoleWalletMemberDto);
  }

  @Patch('delete/:id')
  @ApiOperation({summary: 'Xóa thành viên khỏi ví', description: 'Xóa một thành viên khỏi ví, chỉ quản trị viên mới có quyền thực hiện hành động này'})
  remove(@Param('id') memberId: string) {
    return this.walletMembersService.remove(memberId);
  }
}
