import { Controller, Get, Post, Body, Patch, UseGuards, Req, UseFilters, Query, Param } from '@nestjs/common';
import { MeService } from './me.service';
import { GuardsGuard } from 'src/guard/guard.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Controller('me')
@ApiTags("Me")
@UseGuards(GuardsGuard)
@UseFilters(CatchEverythingFilter)
@ApiBearerAuth('access-token')
export class MeController {
  constructor(private readonly meService: MeService) {}


  @Get()
  @ApiOperation({ summary: 'Trang cá nhân của tôi' })
  me( @Req() req: Request) {
  const user = req['user'];
   return this.meService.me(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  update(@Body() UpdateMeDto: UpdateMeDto, @Req() req: Request) {
    const user = req['user'];
    return this.meService.update(UpdateMeDto, user.userId);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Cập nhật mật khẩu' })
  updatePassword(@Body() ChangePasswordDTO: ChangePasswordDTO, @Req() req: Request) {
    const user = req['user'];
    return this.meService.updatePassword(ChangePasswordDTO, user.userId);
  }

    @Patch('delete-account')
    @ApiOperation({ summary: 'Xoá tài khoản của tôi' })
    remove( @Req() req: Request) {
      const user = req['user'];
      return this.meService.deleteAccount(user.userId);
    }

}
