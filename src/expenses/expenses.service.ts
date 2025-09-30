import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { findWalletByName } from 'src/utilities/find_wallet.by_name';
import { expenses, expenseSplits, settlements, walletMembers, users } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { findUserByName } from 'src/utilities/find_user_by_id';

@Injectable()
export class ExpensesService {
  async create(createExpenseDto: CreateExpenseDto, userId: string) {
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

 async findAll(userId: string) {
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

 async findOne(id: string) {
    return `This action returns a #${id} expense`;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return `This action updates a #${id} expense`;
  }

  async remove(id: string) {
    return `This action removes a #${id} expense`;
  }
}
