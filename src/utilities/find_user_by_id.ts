import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "src/db/db";
import { users } from "src/db/schema";

export async function findUserById(userFullName: string) {
    if(!userFullName) { throw new BadRequestException('Tên người dùng không hợp lệ'); }
    const [find_user] = await db.select({
      userId: users.userId,
      userName: users.userFullName,
    }).from(users).where(and(eq(users.userFullName, userFullName), eq(users.userIsDeleted, false)));
    if(!find_user) { throw new NotFoundException('Không tìm thấy người dùng!'); }
    return find_user;
  }