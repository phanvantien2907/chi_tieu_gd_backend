import { BadRequestException, Body, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { db } from 'src/db/db';
import { expenses, expenseSplits, settlements, users, walletMembers, wallets, walletTransactions } from 'src/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';
import { hashPassword } from 'src/utilities/hash_pasword';
import { findUserByID, findUserByName } from 'src/utilities/find_user_by_id';
import { CreateExpenseDto } from 'src/expenses/dto/create-expense.dto';
import { findWalletByName } from 'src/utilities/find_wallet.by_name';
import { PaginationDto } from 'src/utilities/dtos/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/utilities/constants';
import { formatVND } from 'src/utilities/format_currency';
import { CreateWalletTransactionDto } from 'src/wallet_transactions/dto/create-wallet_transaction.dto';
import { generateTransactionReference } from 'src/utilities/generate_transaction';

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

   async createExpense(createExpenseDto: CreateExpenseDto, userId: string) {
      const find_wallet = await findWalletByName(createExpenseDto.expenseWalletId);
      const [find_member] = await db.select({
        memberId: walletMembers.memberId
      }).from(walletMembers)
      .where(and(
        eq(walletMembers.memberWalletId, find_wallet.walletId),
        eq(walletMembers.memberUserId, userId)
      ));
      if(!find_member) { throw new Error('Bạn không phải thành viên của ví này!'); }
      await db.transaction(async (tx) => {
        const [create_expense] = await tx.insert(expenses).values({
          expenseWalletId: find_wallet.walletId,
          expensePayerId: find_member.memberId,
          expenseDescription: createExpenseDto.expenseDescription,
          expenseAmount: createExpenseDto.expenseAmount.toString(),
        }).returning();
        if(!create_expense) { throw new Error('Tạo khoản chi tiêu thất bại!'); }
        const total_people = createExpenseDto.expense_splits.length + 1;
        const split_amount = Math.floor(createExpenseDto.expenseAmount / total_people);
        await tx.insert(expenseSplits).values({
          splitExpenseId: create_expense.expenseId,
          splitUserId: userId,
          splitAmount: split_amount.toString(),
        });
        for (const item of createExpenseDto.expense_splits) {
          const find_user = await findUserByName(item.splitUserId);
          await tx.insert(expenseSplits).values({
            splitExpenseId: create_expense.expenseId,
            splitUserId: find_user.userId,
            splitAmount: split_amount.toString(),
          });
          const [find_debtor_member] = await tx.select({
            memberId: walletMembers.memberId
          }).from(walletMembers)
          .where(and(
            eq(walletMembers.memberWalletId, find_wallet.walletId),
            eq(walletMembers.memberUserId, find_user.userId)
          ));
          if(!find_debtor_member) {
            throw new Error(`${item.splitUserId} không phải thành viên của ví này!`);
          }
          await tx.insert(settlements).values({
            settlementWalletId: find_wallet.walletId,
            settlementPayerId: find_debtor_member.memberId,
            settlementReceiverId: find_member.memberId,
            settlementAmount: split_amount.toString(),
          });
        }
      });

      return {status: HttpStatus.CREATED, msg: `Thanh toán khoản ${createExpenseDto.expenseDescription} thành công!`}
   }

  async findAllExpense(userId: string) {
    // Lấy memberId của user
    const [userMember] = await db.select({
      memberId: walletMembers.memberId
    }).from(walletMembers)
    .where(eq(walletMembers.memberUserId, userId));

    if (!userMember) {
      return { status: HttpStatus.OK, msg: 'Lấy danh sách chi tiêu thành công!', data: [] };
    }

    // Lấy danh sách expenses user đã tạo với người nợ
    const expensesWithDebtors = await db.select({
      expenseId: expenses.expenseId,
      expenseDescription: expenses.expenseDescription,
      expenseAmount: expenses.expenseAmount,
      expenseDate: expenses.expenseDate,
      debtorName: users.userFullName,
      debtorId: users.userId,
      owedAmount: settlements.settlementAmount,
    }).from(expenses)
    .leftJoin(settlements, and(
      eq(settlements.settlementReceiverId, userMember.memberId),
      eq(settlements.settlementWalletId, expenses.expenseWalletId)
    ))
    .leftJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
    .leftJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(eq(expenses.expensePayerId, userMember.memberId))
    .orderBy(expenses.expenseDate);

    // Group by expenseId
    const groupedExpenses: any = {};
    expensesWithDebtors.forEach(row => {
      if (!groupedExpenses[row.expenseId]) {
        groupedExpenses[row.expenseId] = {
          expenseId: row.expenseId,
          expenseDescription: row.expenseDescription,
          expenseAmount: row.expenseAmount,
          expenseDate: row.expenseDate,
          debtors: []
        };
      }
      if (row.debtorName) {
        groupedExpenses[row.expenseId].debtors.push({
          debtorName: row.debtorName,
          debtorId: row.debtorId,
          owedAmount: row.owedAmount
        });
      }
    });

    const result = Object.values(groupedExpenses);

    return {
      status: HttpStatus.OK,
      msg: 'Lấy danh sách chi tiêu thành công!',
      data: result
    };
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
