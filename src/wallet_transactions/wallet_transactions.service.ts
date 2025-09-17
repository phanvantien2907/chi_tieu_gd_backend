import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletTransactionDto } from './dto/create-wallet_transaction.dto';
import { findUserByID } from 'src/utilities/find_user_by_id';
import { findWalletByName } from 'src/utilities/find_wallet.by_name';
import { db } from 'src/db/db';
import { users, wallets, walletTransactions } from 'src/db/schema';
import { generateTransactionReference } from 'src/utilities/generate_transaction';
import { formatVND } from 'src/utilities/format_currency';
import { and, eq, gte, sql } from 'drizzle-orm';
import { PaginationDto } from 'src/utilities/dtos/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utilities/constants';

@Injectable()
export class WalletTransactionsService {
 async createTransaction(createWalletTransactionDto: CreateWalletTransactionDto, userId: string) {
   const find_user = await findUserByID(userId);
    const find_wallet = await findWalletByName(createWalletTransactionDto.transactionWalletId);
    const generate_reference = await generateTransactionReference(
      createWalletTransactionDto.transactionProvider as 'vnpay' | 'momo' | 'visa' | 'bank' | 'test',
      'deposit',
      userId
    );
    const [create_transaction] = await db.insert(walletTransactions).values({
      transactionWalletId: find_wallet.walletId,
      transactionUserId: find_user.userId,
      transactionAmount: createWalletTransactionDto.transactionAmount.toString(),
      transactionType: 'deposit',
      transactionStatus: 'completed',
      transactionProvider: createWalletTransactionDto.transactionProvider,
      transactionReference: generate_reference,
    }).returning();
    if(!create_transaction) { throw new Error('Tạo giao dịch thất bại!'); }
    return {
      status: 201,
      msg: `Nạp ${formatVND(createWalletTransactionDto.transactionAmount)} thành công vào ví ${find_wallet.walletName}!`,
      data: create_transaction
    };
  }

  async findAllTransactions(paginationDto: PaginationDto, userId: string) {
     const find_user = await findUserByID(userId);
     const { page = 1, limit = DEFAULT_PAGE_SIZE } = paginationDto;
     const skip = (page - 1) * limit;
     const one_year_ago = new Date();
     one_year_ago.setFullYear(one_year_ago.getFullYear() - 1);
     const find_transactions = await db.select({
      transactionId: walletTransactions.transactionId,
      transactionWalletId: wallets.walletName,
      transactionUserId: users.userFullName,
      transactionAmount: walletTransactions.transactionAmount,
      transactionType: walletTransactions.transactionType,
      transactionStatus: walletTransactions.transactionStatus,
      transactionProvider: walletTransactions.transactionProvider,
      transactionReference: walletTransactions.transactionReference,
      transactionNotes: walletTransactions.transactionNotes,
      transactionCreatedAt: walletTransactions.transactionCreatedAt,
      transactionUpdatedAt: walletTransactions.transactionUpdatedAt,
   }).from(walletTransactions)
   .innerJoin(wallets, eq(walletTransactions.transactionWalletId, wallets.walletId))
   .innerJoin(users, eq(walletTransactions.transactionUserId, users.userId))
   .where(and(
    gte(walletTransactions.transactionCreatedAt, one_year_ago.toISOString()),
    eq(walletTransactions.transactionUserId, find_user.userId),
   ))
   .orderBy(walletTransactions.transactionCreatedAt)
   .limit(limit + 1)
   .offset(skip);
   if(!find_transactions || find_transactions.length === 0) {
     throw new NotFoundException('Không tìm thấy giao dịch nào!');
   }
   const next_page = find_transactions.length > limit;
   const real_data = next_page ? find_transactions.slice(0, limit) : find_transactions;
   const result = real_data.map(item => {
     const { transactionAmount, ...rest } = item;
     return {
       transactionId: rest.transactionId,
       transactionWalletId: rest.transactionWalletId,
       transactionUserId: rest.transactionUserId,
       formattedAmount: formatVND(transactionAmount),
       transactionType: rest.transactionType,
       transactionStatus: rest.transactionStatus,
       transactionProvider: rest.transactionProvider,
       transactionReference: rest.transactionReference,
       transactionNotes: rest.transactionNotes,
       transactionCreatedAt: rest.transactionCreatedAt,
       transactionUpdatedAt: rest.transactionUpdatedAt,
     };
   });
   return {status: HttpStatus.OK, msg: `Lấy danh sách giao dịch thành công!`, data: result,
    meta: {
      currentPage: page,
      pageSize: limit,
      hasNextPage: next_page,
      hasPrevPage: page > 1,
      totalRecords: real_data.length,
    }
   }
  }

}
