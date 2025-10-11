import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { findWalletByName } from 'src/utilities/find_wallet.by_name';
import { expenses, expenseSplits, settlements, walletMembers, users, wallets, categories } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { isUuid } from 'uuidv4';


@Injectable()
export class ExpensesService {

  async findAll() {
    const get_all_expenses = await db.select({
      expenseId: expenses.expenseId,
      expenseWalletId: expenses.expenseWalletId,
      expenseDescription: expenses.expenseDescription,
      expenseAmount: expenses.expenseAmount,
      expenseDate: expenses.expenseDate,
      payerId: walletMembers.memberId,
    }).from(expenses)
    .innerJoin(walletMembers, eq(expenses.expensePayerId, walletMembers.memberId))
    .where(eq(expenses.expenseIsDeleted, false))
    .orderBy(expenses.expenseDate);
    if (get_all_expenses.length === 0) { throw new NotFoundException('Không tìm thấy chi tiêu nào!'); }
    const result: any[] = [];
    for (const item of get_all_expenses) {
      const debtors = await db.select({
        debtorName: users.userFullName,
        debtorId: users.userId,
        owedAmount: settlements.settlementAmount,
      }).from(settlements)
      .innerJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
      .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
      .where(and(
        eq(settlements.settlementReceiverId, item.payerId),
        eq(settlements.settlementWalletId, item.expenseWalletId)
      ));
      result.push({
        expenseId: item.expenseId,
        expenseDescription: item.expenseDescription,
        expenseAmount: item.expenseAmount,
        expenseDate: item.expenseDate,
        debtors: debtors
      });
    }

    return {
      status: HttpStatus.OK,
      msg: `Lấy ${result.length} chi tiêu thành công!`,
      data: result
    };
  }

 async findOne(id: string) {
    const find_expense_by_id = await this.findExpenseById(id);
    return {
      status: HttpStatus.OK,
      msg: `Lấy khoản chi tiêu ${find_expense_by_id.expenseDescription} thành công!`,
      data: find_expense_by_id
     }; }


  async remove(id: string) {
    const find_expense_by_id = await this.findExpenseById(id);
    const delete_expense = await db.update(expenses).set({
      expenseIsDeleted: true,
      expenseUpdatedAt: new Date().toISOString(),
    }).where(eq(expenses.expenseId, find_expense_by_id.expenseId));
    if(!delete_expense) { throw new BadRequestException('Xoá chi tiêu không thành công!'); }
    return {status: HttpStatus.NO_CONTENT, msg: 'Xoá chi tiêu thành công!'};
  }

  async findExpenseById(id: string) {
    if(!id || !isUuid(id)) { throw new NotFoundException('ID chi tiêu không hợp lệ!'); }
    const find_expense_by_id = await db.select({
      expenseId: expenses.expenseId,
      expenseWalletId: expenses.expenseWalletId,
      expenseDescription: expenses.expenseDescription,
      expenseAmount: expenses.expenseAmount,
      expenseDate: expenses.expenseDate,
      payerId: walletMembers.memberId,
    }).from(expenses)
    .innerJoin(walletMembers, eq(expenses.expensePayerId, walletMembers.memberId))
    .where(and(
      eq(expenses.expenseId, id),
      eq(expenses.expenseIsDeleted, false)
    ))
    .limit(1);
    if (!find_expense_by_id.length) { throw new NotFoundException('Không tìm thấy chi tiêu nào!');  }
    const expense = find_expense_by_id[0];
    const debtors = await db.select({
      debtorName: users.userFullName,
      debtorId: users.userId,
      owedAmount: settlements.settlementAmount,
    }).from(settlements)
    .innerJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(and(
      eq(settlements.settlementReceiverId, expense.payerId),
      eq(settlements.settlementWalletId, expense.expenseWalletId)
    ));

    return {
      expenseId: expense.expenseId,
      expenseDescription: expense.expenseDescription,
      expenseAmount: expense.expenseAmount,
      expenseDate: expense.expenseDate,
      debtors: debtors
    };
  }
}
