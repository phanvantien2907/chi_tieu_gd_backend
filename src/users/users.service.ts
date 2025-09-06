import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { db } from 'src/db/db';
import { users } from 'src/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { hashPassword } from 'src/utilities/hash_pasword';
import { validate as isUuid } from 'uuid';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(createUserDto.userHashedPassword);
    const create_user = await db.insert(users).values({
      userFullName: createUserDto.userFullName,
      userEmail: createUserDto.userEmail,
      userHashedPassword: hashedPassword,
      userAvatarUrl: createUserDto.userAvatarUrl,
      userRole: createUserDto.userRole,
      userIsDeleted: false
    }).returning({
      userId: users.userId,
      userEmail: users.userEmail,
      userFullName: users.userFullName,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt
    });
    if(!create_user) { throw new NotFoundException('Tạo người dùng không thành công'); }
    return {status: HttpStatus.CREATED, msg: 'Tạo người dùng thành công', data: create_user};
  }

 async findAll() {
    const find_list_user = await db.select({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt
    }).from(users).where(eq(users.userIsDeleted, false)).orderBy(desc(users.userCreatedAt));
    if(find_list_user.length === 0) { throw new NotFoundException('Không có người dùng nào'); }
    return {status: HttpStatus.OK, msg: `Lấy danh sách ${find_list_user.length} người dùng thành công`, data: find_list_user};
  }

  async findOne(id: string) {
    const find_user_by_id = await this.findUserById(id);
    return {status: HttpStatus.OK, msg: 'Lấy thông tin người dùng thành công', data: find_user_by_id};
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const find_user_by_id = await this.findUserById(id);
    const update_user = await db.update(users).set({
      ...(updateUserDto.userFullName && {userFullName: updateUserDto.userFullName}),
      ...(updateUserDto.userHashedPassword && {userHashedPassword: await hashPassword(updateUserDto.userHashedPassword)}),
      ...(updateUserDto.userEmail && {userEmail: updateUserDto.userEmail}),
      ...(updateUserDto.userAvatarUrl && {userAvatarUrl: updateUserDto.userAvatarUrl}),
      ...(updateUserDto.userRole && {userRole: updateUserDto.userRole}),
      userUpdatedAt: new Date().toISOString(),
    })
    .where(eq(users.userId, find_user_by_id.userId))
    .returning({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt
    })
     if(!update_user) { throw new NotFoundException('Cập nhật thông tin không thành công'); }
    return {status: HttpStatus.OK, msg: 'Cập nhật thông tin thành công', data: update_user[0]};
  }

  async remove(id: string) {
    const find_user_by_id = await this.findUserById(id);
    const delete_user = await db.update(users).set({
    userIsDeleted: true,
     userUpdatedAt: new Date().toISOString(),
    }).where(eq(users.userId, find_user_by_id.userId));
    if(!delete_user) { throw new NotFoundException('Xóa người dùng không thành công'); }
    return {status: HttpStatus.NO_CONTENT, msg: 'Xóa người dùng thành công', data: delete_user[0]};
  }

  async findUserById(id: string) {
    if(!id || !isUuid(id)) { throw new BadRequestException('ID không hợp lệ'); }
    const [user] = await db.select({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
      userRole: users.userRole,
      userCreatedAt: users.userCreatedAt,
      userUpdatedAt: users.userUpdatedAt
    }).from(users).where(and(eq(users.userId, id), eq(users.userIsDeleted, false))).limit(1);
    if (!user) { throw new NotFoundException('Không tìm thấy người dùng'); }
    return user;
  }
}
