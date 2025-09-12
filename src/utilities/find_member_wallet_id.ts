import { BadRequestException, NotFoundException } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { db } from "src/db/db";
import { wallets } from "src/db/schema";

export async function findMembersByWalletId(walletName: string) {
    if(!walletName) { throw new BadRequestException('Tên của ví không hợp lệ'); }
    const [find_wallet] = await db.select({
      walletId: wallets.walletId,
      walletName: wallets.walletName,
    }).from(wallets).where(and(eq(wallets.walletName, walletName), eq(wallets.walletIsDeleted, false)));
    if(!find_wallet) { throw new NotFoundException('Không tìm thấy ví!'); }
    return find_wallet;
  }