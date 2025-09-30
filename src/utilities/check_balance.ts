import { db } from "src/db/db";
import { walletTransactions } from "src/db/schema";
import { eq, sql } from "drizzle-orm";
import { BadRequestException } from "@nestjs/common";

export async function checkBalance(userId: string, requiredAmount: number) {
    const [check_balance] = await db.select({
        totalBalance: sql<number>`COALESCE(SUM(CASE
            WHEN ${walletTransactions.transactionType} = 'deposit' THEN ${walletTransactions.transactionAmount}::numeric
            WHEN ${walletTransactions.transactionType} = 'withdrawal' THEN -${walletTransactions.transactionAmount}::numeric
            ELSE 0
        END), 0)`.as('totalBalance')
    })
    .from(walletTransactions)
    .where(eq(walletTransactions.transactionUserId, userId));
    const currentBalance = Number(check_balance?.totalBalance) || 0;
    if (currentBalance <= 0) {   throw new BadRequestException('Bạn không đủ tiền trong ví');   }
    if (currentBalance < requiredAmount) {
        throw new BadRequestException(`Số dư không đủ. Hiện tại: ${currentBalance.toLocaleString('vi-VN')} VNĐ, cần: ${requiredAmount.toLocaleString('vi-VN')} VNĐ`);
    }
    return check_balance;
}