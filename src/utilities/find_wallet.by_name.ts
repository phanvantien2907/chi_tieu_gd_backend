import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "src/db/db";
import { users, wallets } from "src/db/schema";

 export async function findWalletByName(name: string) {
    if(!name) { throw new BadRequestException('Tên ví không hợp lệ'); }
    const [get_wallet_by_name] = await db.select({
      walletId: wallets.walletId,
      userFullName: users.userFullName,
      walletName: wallets.walletName,
      walletDescription: wallets.walletDescription,
      walletCurrency: wallets.walletCurrency,
      walletCreatedAt: wallets.walletCreatedAt,
      walletCreatedBy: wallets.walletCreatedBy
    }).from(wallets)
    .innerJoin(users, eq(wallets.walletCreatedBy, users.userId))
    .where(and(eq(wallets.walletName, name), eq(wallets.walletIsDeleted, false)))
    .limit(1);
    if(!get_wallet_by_name) { throw new NotFoundException('Không tìm thấy ví'); }
    return get_wallet_by_name;
  }