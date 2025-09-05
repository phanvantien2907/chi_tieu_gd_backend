import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalletMembersService } from './wallet_members.service';
import { CreateWalletMemberDto } from './dto/create-wallet_member.dto';
import { UpdateWalletMemberDto } from './dto/update-wallet_member.dto';

@Controller('wallet-members')
export class WalletMembersController {
  constructor(private readonly walletMembersService: WalletMembersService) {}

  @Post()
  create(@Body() createWalletMemberDto: CreateWalletMemberDto) {
    return this.walletMembersService.create(createWalletMemberDto);
  }

  @Get()
  findAll() {
    return this.walletMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.walletMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletMemberDto: UpdateWalletMemberDto) {
    return this.walletMembersService.update(+id, updateWalletMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.walletMembersService.remove(+id);
  }
}
