import { Controller, Get, Post, Body, Patch, UseGuards, Req, UseFilters } from '@nestjs/common';
import { MeService } from './me.service';
import { GuardsGuard } from 'src/guard/guard.guard';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}


  @Get()
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Trang cá nhân của tôi' })
  @UseFilters(CatchEverythingFilter)
  me( @Req() req: Request) {
  const user = req['user'];
   return this.meService.me(user.userId);
  }

  @Patch()
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @UseFilters(CatchEverythingFilter)
  update(@Body() UpdateMeDto: UpdateMeDto, @Req() req: Request) {
    const user = req['user'];
    return this.meService.update(UpdateMeDto, user.userId);
  }

  @Patch('password')
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cập nhật mật khẩu' })
  @UseFilters(CatchEverythingFilter)
  updatePassword(@Body() ChangePasswordDTO: ChangePasswordDTO, @Req() req: Request) {
    const user = req['user'];
    return this.meService.updatePassword(ChangePasswordDTO, user.userId);
  }

  @Patch('delete/account')
  @UseGuards(GuardsGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Xoá tài khoản của tôi' })
  @UseFilters(CatchEverythingFilter)
  remove( @Req() req: Request) {
    const user = req['user'];
    return this.meService.deleteAccount(user.userId);
  }
}
