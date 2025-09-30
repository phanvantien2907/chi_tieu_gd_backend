import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateWalletMemberDto } from './dto/create-wallet_member.dto';
import { UpdateWalletMemberDto } from './dto/update-wallet_member.dto';
import { db } from 'src/db/db';
import { users, walletMembers, wallets } from 'src/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { uuid } from 'drizzle-orm/gel-core';
import { findUserByID } from 'src/utilities/find_user_by_id';
import { findMembersByWalletName } from 'src/utilities/find_member_wallet_name';

@Injectable()
export class WalletMembersService {
 async create(createWalletMemberDto: CreateWalletMemberDto) {
    const find_user = await findUserByID(createWalletMemberDto.memberUserId);
    const find_wallet = await findMembersByWalletName(createWalletMemberDto.memberWalletId);
    const [check_exist] = await db.select().from(walletMembers).where(and(eq(walletMembers.memberUserId, find_user.userId), eq(walletMembers.memberWalletId, find_wallet.memberWalletId)));
    if(check_exist) { throw new BadRequestException('Người này đã là thành viên của ví!'); }
    const [check_exist_role] = await db.select({count: sql`COUNT(*)`}).from(walletMembers).where(eq(walletMembers.memberWalletId, find_wallet.memberWalletId));
    const role = check_exist_role.count == 0 ? 'admin' : 'member';
    const [create_member] = await db.insert(walletMembers).values({
      memberUserId: find_user.userId,
      memberWalletId: find_wallet.memberWalletId,
      memberRole: role,
    }).returning({
      memberId: walletMembers.memberId,
      memberUserId: walletMembers.memberUserId,
      memberWalletId: walletMembers.memberWalletId,
      memberRole: walletMembers.memberRole,
      memberJoinedAt: walletMembers.memberJoinedAt
    });
    return ({status: HttpStatus.CREATED, msg: `Thêm ${find_user.userFullName} vào ví ${find_wallet.memberWalletId} thành công`, data: create_member});
  }

  async findAll() {
    const find_member_wallets = await db.select({
      memberId: walletMembers.memberId,
      walletName: wallets.walletName,
      userName: users.userFullName,
      memberRole: walletMembers.memberRole,
      memberJoinedAt: walletMembers.memberJoinedAt,
    }).from(walletMembers)
    .innerJoin(wallets, eq(walletMembers.memberWalletId, wallets.walletId))
    .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
    .orderBy(desc(walletMembers.memberJoinedAt));
    if(find_member_wallets.length == 0) { throw new NotFoundException('Không thấy thành viên nào trong ví nào!'); }
    const grouped_wallet = new Map<string, any>();

    return {status: HttpStatus.OK, msg: `Lấy ${grouped_wallet.size} ví thành công!`, data: [...grouped_wallet.values()]};
  }

  async findOne(id: string) {
    const find_member_by_id = await this.findMemberById(id);
    const grouped_wallet = new Map<string, any>();
    for ( const item of [find_member_by_id] ) {
      if (!grouped_wallet.has(item.walletName)) {
        grouped_wallet.set(item.walletName, {
          walletName: item.walletName,
          members: [],
        });
      }
      grouped_wallet.get(item.walletName).members.push(item);
    }
    return {status: HttpStatus.OK, msg: `Thành viên ${find_member_by_id.userName} thuộc ${grouped_wallet.size} ví`, data: [...grouped_wallet.values()]};
  }

  async updateRole(memberId: string, updateWalletMemberDto: UpdateWalletMemberDto) {
    const current_member = await this.findMemberById(memberId);
    if(!current_member || current_member.memberRole !== 'admin') { throw new ForbiddenException('Bạn không có quyền thay đổi thành viên này!')}
    const new_admin_user = await findUserByID(updateWalletMemberDto.memberUserId!);
    const wallet = await findMembersByWalletName(updateWalletMemberDto.memberWalletId!);
    const [new_admin_member] = await db.select().from(walletMembers)
    .where(and(
      eq(walletMembers.memberUserId, new_admin_user.userId),
      eq(walletMembers.memberWalletId, wallet.memberWalletId),
      eq(walletMembers.memberIsDeleted, false),
    )).limit(1);
    if(!new_admin_member) { throw new  NotFoundException('Không tìm thấy thành viên này trong ví!')}
    await db.transaction(async (tx) => {
      await tx.update(walletMembers).set({
        memberRole: 'member'
      }).where(and(
        eq(walletMembers.memberWalletId, new_admin_member.memberWalletId),
        eq(walletMembers.memberIsDeleted, false),
      ));
       const [update_admin] = await tx.update(walletMembers).set({
       memberRole: 'admin'
    }).where(eq(walletMembers.memberId, new_admin_member.memberId)).returning();
    if(!update_admin) { throw new NotFoundException('Cập nhật vai trò thành viên không thành công!'); }
    return {status: HttpStatus.OK, msg: `Thay đổi quyền thành công!`, data: {
      old_admin: {
        full_name: current_member.userName,
        role: current_member.memberRole,
      },
      new_admin: {
        full_name: new_admin_user.userFullName,
        role: update_admin.memberRole,
      }
    }}
    })
  }

  async remove(id: string) {
     const find_member_by_id = await this.findMemberById(id);
     const [delete_member] = await db.update(walletMembers).set({
      memberIsDeleted: true
     }).where(eq(walletMembers.memberId, find_member_by_id.memberId)).returning();
     if(delete_member.memberRole === 'admin') { throw new ForbiddenException('Bạn không có quyền xóa thành viên này!');  }
     if(!delete_member) { throw new NotFoundException('Xóa thành viên không thành công!'); }
     return {status: HttpStatus.NO_CONTENT, msg: `Xóa ${find_member_by_id.userName} ra khỏi ví ${find_member_by_id.walletName} thành công!`};
  }


  async findMemberById(memberId: string) {
  if(!memberId || !uuid(memberId)) { throw new BadRequestException('ID của thành viên không hợp lệ'); }
   const [find_member] = await db.select({
    memberId: walletMembers.memberId,
    memberWalletId: walletMembers.memberWalletId,
    walletName: wallets.walletName,
    userId: users.userId,
    userName: users.userFullName,
    memberRole: walletMembers.memberRole,
    memberJoinedAt: walletMembers.memberJoinedAt,
   }).from(walletMembers)
   .innerJoin(wallets, eq(walletMembers.memberWalletId, wallets.walletId))
   .innerJoin(users, eq(walletMembers.memberUserId, users.userId))
   .where(and(
    eq(walletMembers.memberId, memberId),
    eq(walletMembers.memberIsDeleted, false),
    eq(wallets.walletIsDeleted, false),
    eq(users.userIsDeleted, false),
   ));
    if(!find_member) { throw new NotFoundException('Không tìm thấy thành viên nào trong ví!'); }
    return find_member;
  }

  // Tìm tất cả memberIds của user này
  async findMemberIdsByUserId(userId: string) {
    const memberIds = await db.select({
      memberId: walletMembers.memberId
    }).from(walletMembers)
    .where(eq(walletMembers.memberUserId, userId));

    return memberIds.map(item => item.memberId);
  }
}
