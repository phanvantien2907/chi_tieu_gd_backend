import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "src/db/db";
import { users } from "src/db/schema";
import { isUuid } from "uuidv4";

export async function findUserByName(userFullName: string) {
    if(!userFullName) { throw new BadRequestException('Tên người dùng không hợp lệ'); }
    const [find_user] = await db.select({
      userId: users.userId,
      userName: users.userFullName,
    }).from(users).where(and(eq(users.userFullName, userFullName), eq(users.userIsDeleted, false)));
    if(!find_user) { throw new NotFoundException('Không tìm thấy người dùng!'); }
    return find_user;
  }

  export async function findUserByID(userId: string) {
    if(!userId) { throw new BadRequestException('ID người dùng không hợp lệ'); }
    const [find_user] = await db.select({
      userId: users.userId,
      userFullName: users.userFullName,
      userEmail: users.userEmail,
      userAvatarUrl: users.userAvatarUrl,
    }).from(users).where(and(eq(users.userId, userId), eq(users.userIsDeleted, false)));
    if(!find_user) { throw new NotFoundException('Không tìm thấy người dùng!'); }
    return find_user;
  }