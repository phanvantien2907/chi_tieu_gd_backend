import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { db } from 'src/db/db';
import { expenses, expenseSplits, users } from 'src/db/schema';
import { isUuid } from 'uuidv4';

@Injectable()
export class ExpenseSplitsService {
 async findAll() {
    const find_expense_splits = await db.select({
      splitId: expenseSplits.splitId,
      expenseDescription: expenses.expenseDescription,
      expenseAmount: expenses.expenseAmount,
      userName: users.userFullName,
      splitAmount: expenseSplits.splitAmount
    }).from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.splitExpenseId, expenses.expenseId))
    .innerJoin(users, eq(expenseSplits.splitUserId, users.userId))
    .where(eq(expenseSplits.splitIsSettled, false))
    .orderBy(asc(expenseSplits.splitId));
    if(find_expense_splits.length === 0) {  throw new NotFoundException('Không tìm thấy khoản chia nào!');}

    return {
      status: HttpStatus.OK,
      msg: `Lấy ${find_expense_splits.length} khoản chia thành công!`,
      data: find_expense_splits
    };
  }

  async findOne(id: string) {
    const find_expense_split_by_id = await this.findExpenseSplitById(id);
    return {status: HttpStatus.OK, msg: `Lấy khoản chia ${find_expense_split_by_id[0].expenseDescription} thành công!`, data: find_expense_split_by_id};
  }

  async remove(id: string) {
    const find_expense_split_by_id = await this.findExpenseSplitById(id);
    const remove_expense_split = await db.update(expenseSplits).set({
      splitIsSettled: true
    })
    .where(eq(expenseSplits.splitId, id));
    if(!remove_expense_split) { throw new BadRequestException('Xoá khoản chia thất bại!'); }
    return {status: HttpStatus.NOT_FOUND, msg: `Xoá khoản chia ${find_expense_split_by_id[0].expenseDescription} thành công!`};
  }

  async findExpenseSplitById(id: string) {
    if(!id || !isUuid(id)) { throw new NotFoundException('ID khoản chia không hợp lệ!'); }
    const find_expense_split_by_id =  await db.select({
      splitId: expenseSplits.splitId,
      expenseDescription: expenses.expenseDescription,
      expenseAmount: expenses.expenseAmount,
      userName: users.userFullName,
      splitAmount: expenseSplits.splitAmount
    }).from(expenseSplits)
    .innerJoin(expenses, eq(expenseSplits.splitExpenseId, expenses.expenseId))
    .innerJoin(users, eq(expenseSplits.splitUserId, users.userId))
    .where(and(
      eq(expenseSplits.splitIsSettled, false),
      eq(expenseSplits.splitId, id)
    ));
    if(find_expense_split_by_id.length === 0) {  throw new NotFoundException('Không tìm thấy khoản chia nào!');}
    return find_expense_split_by_id;
  }
}
