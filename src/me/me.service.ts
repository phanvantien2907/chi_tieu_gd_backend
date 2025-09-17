import { BadRequestException, Body, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { db } from 'src/db/db';
import { users } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';
import { hashPassword } from 'src/utilities/hash_pasword';
import { findUserByID } from 'src/utilities/find_user_by_id';

@Injectable()
export class MeService {

  async me(userId: string) {
    const [user] = await db.select({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt,
    }).from(users).where(and(
      eq(users.userId, userId),
      eq(users.userIsDeleted, false)
    ))
    if(!user) { throw new NotFoundException('Người dùng không tồn tại'); }
    return {status: HttpStatus.OK, msg: 'Lấy thông tin trang cá nhân thành công', data: user};
  }

  async update(@Body() UpdateMeDto: UpdateMeDto, userId: string) {
    const find_user = await this.me(userId);
    if(!find_user) { throw new NotFoundException('Người dùng không tồn tại'); }
    const update_user = await db.update(users).set({
      ...(UpdateMeDto.user_email && {userEmail: UpdateMeDto.user_email}),
      ...(UpdateMeDto.user_full_name && {userFullName: UpdateMeDto.user_full_name}),
      ...(UpdateMeDto.user_avatar_url && {userAvatarUrl: UpdateMeDto.user_avatar_url}),
      userUpdatedAt: new Date().toISOString(),
    })
    .where(eq(users.userId, find_user.data.userId))
    .returning({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt,
    });
    if(!update_user) { throw new NotFoundException('Cập nhật thông tin không thành công'); }
    return {status: HttpStatus.OK, msg: 'Cập nhật thông tin thành công', data: update_user[0]};
  }

 async updatePassword(@Body() ChangePasswordDTO: ChangePasswordDTO, userId: string) {
    const find_user = await this.findUserByIdWithPassword(userId);
    if(!find_user) { throw new NotFoundException('Người dùng không tồn tại'); }
    const isMatch = await bcrypt.compare(ChangePasswordDTO.oldPassword, find_user.userHashedPassword);
    if (!isMatch) { throw new UnauthorizedException('Mật khẩu cũ không đúng'); }
    const hashedPassword = await hashPassword(ChangePasswordDTO.newPassword);
    const update_password = await db.update(users).set({
      userHashedPassword: hashedPassword,
      userUpdatedAt: new Date().toISOString(),
    })
    .where(eq(users.userId, find_user.userId));
    if(!update_password) { throw new BadRequestException('Cập nhật mật khẩu không thành công'); }
    return {status: HttpStatus.OK, msg: 'Cập nhật mật khẩu thành công'};
 }

 async deleteAccount(userId: string) {
  const find_user = await this.findUserById(userId);
  if(!find_user) { throw new NotFoundException('Người dùng không tồn tại'); }
  const delete_user = await db.update(users).set({
    userIsDeleted: true,
    userUpdatedAt: new Date().toISOString(),
  })
  .where(eq(users.userId, find_user.userId));
  if(!delete_user) { throw new BadRequestException('Xoá tài khoản không thành công'); }
  return {status: HttpStatus.NO_CONTENT, msg: 'Xoá tài khoản thành công'};
 }

 async TotalBalance(userId: string) {
  const find_user = await findUserByID(userId);
  // const [total_balance] =
 }

 async findUserByIdWithPassword(userId: string) {
  const [user] = await db
    .select({
      userId: users.userId,
      userHashedPassword: users.userHashedPassword,
    })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.userIsDeleted, false)));

  if (!user) throw new NotFoundException('Người dùng không tồn tại');
  return user;
 }

 async findUserById(userId: string) {
  const [user] = await db
    .select({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt,
    })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.userIsDeleted, false)));

  if (!user) throw new NotFoundException('Người dùng không tồn tại');
  return user;
 }

}
