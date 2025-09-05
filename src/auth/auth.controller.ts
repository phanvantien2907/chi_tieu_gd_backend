import { Controller, Post, Body, UseGuards, Req, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterDTO } from 'src/auth/dto/register.dto';
import { LoginrDTO } from 'src/auth/dto/login.dto';
import { RefreshTokenDTO } from 'src/auth/dto/refresh-token.dto';
import { GuardsGuard } from 'src/guard/guard.guard';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';


@Controller('auth')
@ApiTags('Authentication')
@UseFilters(CatchEverythingFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Tạo tài khoản mới' })
  register(@Body() registerData: RegisterDTO) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập vào hệ thống' })
  login(@Body() loginData: LoginrDTO) {
  return this.authService.login(loginData);
  }

  @Post('refresh-token')
  @ApiBearerAuth('access-token')
  @UseGuards(GuardsGuard)
  @ApiOperation({ summary: 'Làm mới token' })
  refreshtoken(@Body() rftokenDTO: RefreshTokenDTO, @Req() req: Request) {
  const user = req['user'];
  return this.authService.refreshtoken(rftokenDTO.token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất khỏi hệ thống' })
  @ApiBearerAuth('access-token')
  @UseGuards(GuardsGuard)
  logout(@Req() req: Request) {
  const user = req['user'];
  return this.authService.logout(user.userId);
  }

}
