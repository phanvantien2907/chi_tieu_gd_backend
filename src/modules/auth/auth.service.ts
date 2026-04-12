import {
  BadRequestException,
  Body,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { and, eq, gt } from 'drizzle-orm';
import { refreshTokens, users } from 'src/database/schema';
import { LoginrDTO } from 'src/modules/auth/dto/login.dto';
import { RegisterDTO } from 'src/modules/auth/dto/register.dto';
import { hashPassword } from 'src/utilities/hash_pasword';
import { v4 as uuidv4 } from 'uuid';
import { DrizzleDB } from 'src/database/db';
import { DRIZZLE } from 'src/database/database.module';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService,
     @Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async register(@Body() registerData: RegisterDTO) {
    const exiting_users = await this.db
      .select({ user_email: users.userEmail })
      .from(users)
      .where(eq(users.userEmail, registerData.userEmail))
      .limit(1);
    if (!exiting_users) {
      throw new BadRequestException('Người dùng đã tồn tại');
    }
    const hashedPassword = await hashPassword(registerData.userHashedPassword);
    const create_user = await this.db
      .insert(users)
      .values({
        userEmail: registerData.userEmail,
        userFullName: registerData.userFullName,
        userHashedPassword: hashedPassword,
        userIsDeleted: false,
        userRole: registerData.userRole || 'client',
      })
      .returning({
        userId: users.userId,
        userEmail: users.userEmail,
        userFullname: users.userFullName,
        userRole: users.userRole,
        userCreatedAt: users.userCreatedAt,
        userUpdatedAt: users.userUpdatedAt,
      });
    if (!create_user) {
      throw new BadRequestException('Đăng ký không thành công');
    }
    return {
      status: HttpStatus.CREATED,
      msg: 'Đăng ký thành công',
      data: create_user,
    };
  }

  async login(@Body() loginData: LoginrDTO) {
    const exiting_users = await this.db
      .select({
        userId: users.userId,
        userEmail: users.userEmail,
        userHashedPassword: users.userHashedPassword,
        userIsDeleted: users.userIsDeleted,
        userRole: users.userRole,
      })
      .from(users)
      .where(eq(users.userEmail, loginData.userEmail))
      .limit(1);
    if (exiting_users.length == 0) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    const valid_password = await bcrypt.compare(
      loginData.userHashedPassword,
      exiting_users[0].userHashedPassword,
    );
    if (!valid_password) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }
    if (exiting_users[0].userIsDeleted == true) {
      throw new BadRequestException('Tài khoản đã bị khóa');
    }
    const token = await this.generatortoken(
      exiting_users[0].userId,
      exiting_users[0].userRole,
    );
    return { msg: 'Đăng nhập thành công', ...token, status: HttpStatus.OK };
  }

  async generatortoken(userId: string, userRole: string) {
    const access_token = await this.jwtService.signAsync(
      { userId, userRole },
      { expiresIn: '1h', secret: process.env.JWT_SECRET! },
    );
    const refresh_token = uuidv4();
    await this.db
      .insert(refreshTokens)
      .values({
        userId,
        token: refresh_token,
        expDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .onConflictDoUpdate({
        target: refreshTokens.userId,
        set: {
          token: refresh_token,
          expDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    return { access_token, refresh_token, status: HttpStatus.OK };
  }

  async logout(userId: string) {
    const token = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .limit(1);
    if (!token) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
    return { msg: 'Đăng xuất thành công', status: HttpStatus.NO_CONTENT };
  }

  async refreshtoken(rftoken: string, userRole: string) {
    const token = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, rftoken),
          gt(refreshTokens.expDate, new Date().toISOString()),
        ),
      )
      .limit(1);
    if (token.length === 0) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }
    const [user] = await this.db
      .select({ userId: users.userId, userRole: users.userRole })
      .from(users)
      .where(eq(users.userId, token[0].userId))
      .limit(1);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const access_token = await this.jwtService.signAsync(
      { userId: user.userId, userRole: user.userRole },
      { expiresIn: '1h', secret: process.env.JWT_SECRET },
    );
    await this.generatortoken(user.userId, user.userRole);
    return {
      msg: 'Làm mới token thành công',
      access_token,
      status: HttpStatus.OK,
    };
  }
}
