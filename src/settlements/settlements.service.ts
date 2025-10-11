import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { db } from 'src/db/db';
import { settlements, walletMembers, wallets, users } from 'src/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { isUuid } from 'uuidv4';

@Injectable()
export class SettlementsService {

 async findAll() {
    const settlements_with_payer = await db.select({
      settlementId: settlements.settlementId,
      walletName: wallets.walletName,
      payerId: settlements.settlementPayerId,
      receiverId: settlements.settlementReceiverId,
      payerName: users.userFullName,
      settlementAmount: settlements.settlementAmount,
      settlementDate: settlements.settlementDate
    }).from(settlements)
    .innerJoin(wallets, eq(settlements.settlementWalletId, wallets.walletId))
    .innerJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(eq(settlements.isPaid, false))
    .orderBy(asc(settlements.settlementDate));

    if(settlements_with_payer.length === 0) {   throw new NotFoundException('Không có khoản nợ nào!'); }

    const result: any[] = [];
    for (const item of settlements_with_payer) {
      const [receiver] = await db.select({
        receiverName: users.userFullName
      }).from(walletMembers)
      .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
      .where(eq(walletMembers.memberId, item.receiverId));

      result.push({
        settlementId: item.settlementId,
        walletName: item.walletName,
        payerName: item.payerName,
        receiverName: receiver?.receiverName || 'Unknown',
        settlementAmount: item.settlementAmount,
        settlementDate: item.settlementDate
      });
    }

    return {
      status: 200,
      msg: `Lấy ${result.length} khoản nợ thành công!`,
      data: result
    };
  }

  async findOne(id: string) {
    const find_settlements_by_id = await this.findSettlementsByID(id);
    return {
      status: 200,
      msg: `Lấy khoản nợ của ${find_settlements_by_id[0].payerName} thành công!`,
      data: find_settlements_by_id[0]
    };
  }

  async findSettlementsByID(id: string) {
    if(!id || !isUuid(id)) { throw new NotFoundException('ID khoản nợ không hợp lệ!'); }
       const settlements_with_payer = await db.select({
      settlementId: settlements.settlementId,
      walletName: wallets.walletName,
      payerId: settlements.settlementPayerId,
      receiverId: settlements.settlementReceiverId,
      payerName: users.userFullName,
      settlementAmount: settlements.settlementAmount,
      settlementDate: settlements.settlementDate
    }).from(settlements)
    .innerJoin(wallets, eq(settlements.settlementWalletId, wallets.walletId))
    .innerJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(and(
      eq(settlements.isPaid, false),
      eq(settlements.settlementId, id)
    ))

    if(settlements_with_payer.length === 0) {   throw new NotFoundException('Không có khoản nợ nào!'); }

    const result: any[] = [];
    for (const item of settlements_with_payer) {
      const [receiver] = await db.select({
        receiverName: users.userFullName
      }).from(walletMembers)
      .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
      .where(eq(walletMembers.memberId, item.receiverId));

      result.push({
        settlementId: item.settlementId,
        walletName: item.walletName,
        payerName: item.payerName,
        receiverName: receiver?.receiverName || 'Unknown',
        settlementAmount: item.settlementAmount,
        settlementDate: item.settlementDate,
      });
    }

    return result;
  }

  async getStats() {
    const allSettlements = await db.select({
      settlementAmount: settlements.settlementAmount,
      isPaid: settlements.isPaid
    }).from(settlements);

    let totalUnpaidAmount = 0;
    let totalPaidAmount = 0;
    let unpaidCount = 0;
    let paidCount = 0;

    allSettlements.forEach(item => {
      const amount = parseFloat(item.settlementAmount);
      if (item.isPaid) {
        totalPaidAmount += amount;
        paidCount++;
      } else {
        totalUnpaidAmount += amount;
        unpaidCount++;
      }
    });

    const debtorStats = await db.select({
      payerName: users.userFullName,
      settlementAmount: settlements.settlementAmount
    }).from(settlements)
    .innerJoin(walletMembers, eq(settlements.settlementPayerId, walletMembers.memberId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(eq(settlements.isPaid, false));

    const debtorMap = new Map();
    debtorStats.forEach(item => {
      const amount = parseFloat(item.settlementAmount);
      if (debtorMap.has(item.payerName)) {
        debtorMap.set(item.payerName, debtorMap.get(item.payerName) + amount);
      } else {
        debtorMap.set(item.payerName, amount);
      }
    });

    const topDebtors = Array.from(debtorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, totalOwed: amount.toString() }));

    const creditorStats = await db.select({
      receiverName: users.userFullName,
      settlementAmount: settlements.settlementAmount
    }).from(settlements)
    .innerJoin(walletMembers, eq(settlements.settlementReceiverId, walletMembers.memberId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .where(eq(settlements.isPaid, false));

    const creditorMap = new Map();
    creditorStats.forEach(item => {
      const amount = parseFloat(item.settlementAmount);
      if (creditorMap.has(item.receiverName)) {
        creditorMap.set(item.receiverName, creditorMap.get(item.receiverName) + amount);
      } else {
        creditorMap.set(item.receiverName, amount);
      }
    });

    const topCreditors = Array.from(creditorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, amount]) => ({ name, totalReceivable: amount.toString() }));

    const walletStats = await db.select({
      walletName: wallets.walletName,
      settlementAmount: settlements.settlementAmount,
      isPaid: settlements.isPaid
    }).from(settlements)
    .innerJoin(wallets, eq(settlements.settlementWalletId, wallets.walletId));

    const walletMap = new Map();
    walletStats.forEach(item => {
      const amount = parseFloat(item.settlementAmount);
      if (!walletMap.has(item.walletName)) {
        walletMap.set(item.walletName, { unpaid: 0, paid: 0, count: 0 });
      }
      const stat = walletMap.get(item.walletName);
      stat.count++;
      if (item.isPaid) {
        stat.paid += amount;
      } else {
        stat.unpaid += amount;
      }
    });

    const walletBreakdown = Array.from(walletMap.entries()).map(([name, stats]) => ({
      walletName: name,
      unpaidAmount: stats.unpaid.toString(),
      paidAmount: stats.paid.toString(),
      totalCount: stats.count
    }));

    return {
      status: 200,
      msg: 'Lấy thống kê khoản nợ thành công!',
      data: {
        overview: {
          totalSettlements: allSettlements.length,
          totalUnpaidAmount: totalUnpaidAmount.toString(),
          totalPaidAmount: totalPaidAmount.toString(),
          unpaidCount,
          paidCount,
          paymentRate: allSettlements.length > 0 ?
            Math.round((paidCount / allSettlements.length) * 100) : 0
        },
        topDebtors,
        topCreditors,
        alerts: {
          highRiskDebtors: debtorStats.filter(s => parseFloat(s.settlementAmount) > 100000).length,
          totalUnpaidCount: unpaidCount,
          averageDebtAmount: unpaidCount > 0 ?
            Math.round(totalUnpaidAmount / unpaidCount).toString() : "0"
        },
        walletBreakdown
      }
    };
  }
}

