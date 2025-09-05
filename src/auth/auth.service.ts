import { BadRequestException, Body, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDTO } from 'src/auth/dto/register.dto';
import { db } from 'src/db/db';
import { refreshTokens, users } from 'src/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { LoginrDTO } from 'src/auth/dto/login.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { hashPassword } from 'src/utilities/hash_pasword';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  async register(@Body() registerData: RegisterDTO) {
    const exiting_users = await db.select({user_email: users.userEmail}).from(users)
    .where(eq(users.userEmail, registerData.user_email)).limit(1);
    if(!exiting_users) { throw new BadRequestException('Người dùng đã tồn tại'); }
    const hashedPassword = await hashPassword(registerData.user_hashed_password);
    const create_user = await db.insert(users).values({
      userEmail: registerData.user_email,
      userFullName: registerData.user_full_name,
      userHashedPassword: hashedPassword,
      userIsDeleted: false,
      userRole: 'client'
    }).returning({
      userId: users.userId,
      userEmail: users.userEmail,
      userFullname: users.userFullName,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt
    });
    if(!create_user) { throw new BadRequestException('Đăng ký không thành công'); }
    return {status: HttpStatus.CREATED, msg: 'Đăng ký thành công', data: create_user};
  }

  async login(@Body() loginData: LoginrDTO) {
    const exiting_users = await db.select(
    {userId: users.userId, userEmail: users.userEmail, userHashedPassword: users.userHashedPassword, userIsDeleted: users.userIsDeleted})
    .from(users).where(eq(users.userEmail, loginData.user_email)).limit(1);
     if(exiting_users.length == 0) { throw new NotFoundException('Người dùng không tồn tại!') }
     const valid_password = await bcrypt.compare(loginData.user_hashed_password, exiting_users[0].userHashedPassword);
     if(!valid_password) { throw new UnauthorizedException('Mật khẩu không đúng'); }
    if(exiting_users[0].userIsDeleted == true) { throw new BadRequestException('Tài khoản đã bị khóa'); }
    const token = await this.generatortoken(exiting_users[0].userId);
    return {msg: 'Đăng nhập thành công', ...token, status: HttpStatus.OK};
  }

  async generatortoken(userId: string) {
    const access_token = await this.jwtService.signAsync({ userId }, {expiresIn: '1h', secret: process.env.JWT_SECRET!});
    const refresh_token = uuidv4();
    await db.insert(refreshTokens).values({
      userId,
      token: refresh_token,
      expDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }).onConflictDoUpdate({
      target: refreshTokens.userId,
      set: {
        token: refresh_token,
        expDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
    return { access_token, refresh_token, status: HttpStatus.OK };
  }

  async logout(userId: string) {
    const token = await db.select().from(refreshTokens).where(eq(refreshTokens.userId, userId)).limit(1);
    if(!token) { throw new NotFoundException('Người dùng không tồn tại'); }
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    return { msg: 'Đăng xuất thành công', status: HttpStatus.NO_CONTENT };
  }

   async refreshtoken(rftoken: string) {
    const token = await db.select().from(refreshTokens).where(and(
      eq(refreshTokens.token, rftoken),
      gt(refreshTokens.expDate, new Date().toISOString())
    )).limit(1);
    if (!token) { throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn'); }
    const access_token = await this.jwtService.signAsync({ userId: token[0].userId }, {expiresIn: '1h', secret: process.env.JWT_SECRET});
    await this.generatortoken(token[0].userId);
    return { msg: 'Làm mới token thành công', access_token, status: HttpStatus.OK };
  }

}
