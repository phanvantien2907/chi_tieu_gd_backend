import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq, ilike } from "drizzle-orm";
import { db } from "src/db/db";
import { users, walletMembers, wallets } from "src/db/schema";

export async function findMembersByWalletName(walletName: string) {
    if(!walletName) { throw new BadRequestException('Tên của ví không hợp lệ'); }
    const [find_wallet] = await db.select({
      memberId: walletMembers.memberId,
      memberWalletId: wallets.walletId,
      memberUserId: users.userFullName,
      memberWalletName: wallets.walletName,
    }).from(walletMembers)
    .innerJoin(wallets, eq(walletMembers.memberWalletId, wallets.walletId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(and(
     eq(wallets.walletName, walletName),
     eq(users.userIsDeleted, false),
     eq(wallets.walletIsDeleted, false),
     eq(walletMembers.memberIsDeleted, false))
    ).limit(1);
    if(!find_wallet) { throw new NotFoundException('Không tìm thấy ví!'); }
    return find_wallet;
  }
