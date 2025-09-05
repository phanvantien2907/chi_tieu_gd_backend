import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { MeService } from './me.service';
import { GuardsGuard } from 'src/guard/guard.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}


  @Get()
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Trang cá nhân của tôi' })
  me( @Req() req: Request) {
  const user = req['user'];
   return this.meService.me(user.userId);
  }

  @Patch()
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  update(@Body() UpdateMeDto: UpdateMeDto, @Req() req: Request) {
    const user = req['user'];
    return this.meService.update(UpdateMeDto, user.userId);
  }

  @Patch('password')
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật mật khẩu' })
  updatePassword(@Body() ChangePasswordDTO: ChangePasswordDTO, @Req() req: Request) {
    const user = req['user'];
    return this.meService.updatePassword(ChangePasswordDTO, user.userId);
  }

  @Put('delete/account')
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xoá tài khoản của tôi' })
  remove( @Req() req: Request) {
    const user = req['user'];
    return this.meService.deleteAccount(user.userId);
  }
}
