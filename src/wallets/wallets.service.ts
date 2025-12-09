import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { db } from 'src/db/db';
import { users, walletMembers, wallets } from 'src/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import * as QRCode from 'qrcode';
import { isUuid } from 'uuidv4';

@Injectable()
export class WalletsService {
 async create(createWalletDto: CreateWalletDto) {
  await db.transaction(async (tx) => {
    const get_name_user = await this.getUserByName(createWalletDto.walletCreatedBy);
    const [create_wallet] = await tx.insert(wallets).values({
      walletName: createWalletDto.walletName,
      walletDescription: createWalletDto.walletDescription,
      walletCurrency: createWalletDto.walletCurrency || 'VND',
      walletCreatedBy: get_name_user.userId,
      walletQrCode: ''
    }).returning({
      walletId: wallets.walletId,
      walletName: wallets.walletName,
      walletCreatedBy: wallets.walletCreatedBy,
      walletDescription: wallets.walletDescription,
      walletCurrency: wallets.walletCurrency,
      walletCreatedAt: wallets.walletCreatedAt,
      walletUpdatedAt: wallets.walletUpdatedAt,
    });
    const invite_url = await this.getQrCode(create_wallet.walletId);
    const generator_qr_code = await QRCode.toDataURL(invite_url);
    await tx.update(wallets).set({
      walletQrCode: generator_qr_code
    }).where(eq(wallets.walletId, create_wallet.walletId));
    if(!create_wallet) { throw new BadRequestException('Tạo ví thất bại, vui lòng thử lại!'); }
    const [check_exist_admin] = await tx.select().from(walletMembers)
    .where(and(eq(walletMembers.memberUserId, get_name_user.userId), eq(walletMembers.memberWalletId, create_wallet.walletId)));
    if(check_exist_admin) { throw new BadRequestException('Người dùng này đã là thành viên của ví!'); }
    await tx.insert(walletMembers).values({
      memberUserId: get_name_user.userId,
      memberWalletId: create_wallet.walletId,
      memberRole: 'admin',
    })
    return {status: HttpStatus.CREATED, msg: 'Tạo ví thành công', data: {
      ...create_wallet,
      QRCode: invite_url
    }}
  })
  }

   async findAll() {
    const find_list_wallets = await db.select({
      walletId: wallets.walletId,
      userFullName: users.userFullName,
      walletName: wallets.walletName,
      walletDescription: wallets.walletDescription,
      walletCurrency: wallets.walletCurrency,
      walletCreatedAt: wallets.walletCreatedAt,
      walletCreatedBy: wallets.walletCreatedBy
    }).from(wallets)
    .innerJoin(users, eq(wallets.walletCreatedBy, users.userId))
    .orderBy(desc(wallets.walletCreatedAt));
    if(find_list_wallets.length === 0) { throw new NotFoundException('Không có ví nào trong hệ thống'); }
    const response = await Promise.all(find_list_wallets.map(async w => ({
      ...w,
      walletQrCode: await this.getQrCode(w.walletId),
    })))
    return {status: HttpStatus.OK, msg: `Lấy danh sách ${find_list_wallets.length} ví thành công`, data: response};
   }

 async findOne(walletId: string) {
   const get_wallet_by_id = await this.getWalletById(walletId);
   return {status: HttpStatus.OK, msg: 'Lấy thông tin ví thành công', data: get_wallet_by_id};
  }

  async update(walletId: string, updateWalletDto: UpdateWalletDto) {
    const get_wallet_by_id = await this.getWalletById(walletId);
    const invite_url = await this.getQrCode(get_wallet_by_id.walletId);
    const generator_qr_code = await QRCode.toDataURL(invite_url);
    const [update_wallet] = await db.update(wallets).set({
      ...(updateWalletDto.walletName && {walletName: updateWalletDto.walletName}),
      ...(updateWalletDto.walletDescription && {walletDescription: updateWalletDto.walletDescription}),
      ...(updateWalletDto.walletCreatedBy && {walletCreatedBy: (await this.getUserByName(updateWalletDto.walletCreatedBy)).userId}),
      ...(updateWalletDto.walletCurrency && {walletCurrency: updateWalletDto.walletCurrency}),
      walletQrCode: generator_qr_code,
      walletUpdatedAt: new Date().toISOString(),
    }).where(eq(wallets.walletId, get_wallet_by_id.walletId))
    .returning({
      walletId: wallets.walletId,
      walletName: wallets.walletName,
      walletDescription: wallets.walletDescription,
      walletCurrency: wallets.walletCurrency,
      walletCreatedAt: wallets.walletCreatedAt,
      walletCreatedBy: wallets.walletCreatedBy,
      walletUpdatedAt: wallets.walletUpdatedAt
    });
    if(!update_wallet) { throw new BadRequestException('Cập nhật ví thất bại, vui lòng thử lại!'); }
    return {status: HttpStatus.OK, msg: 'Cập nhật ví thành công', data: {
      ...update_wallet,
      walletQrCode: invite_url
    }}
  }

 async remove(walletId: string) {
     const get_wallet_by_id = await this.getWalletById(walletId);
      const delete_wallet = await db.update(wallets).set({
        walletIsDeleted: true,
        walletUpdatedAt: new Date().toISOString()
      }).where(eq(wallets.walletId, get_wallet_by_id.walletId));
      if(!delete_wallet) { throw new BadRequestException('Xoá ví thất bại, vui lòng thử lại!'); }
      return {status: HttpStatus.NO_CONTENT, msg: 'Xoá ví thành công'};
  }

  async getUserByName(name: string) {
    const [get_user_by_name] = await db.select({userId: users.userId, userFullName: users.userFullName}).from(users).where(and(eq(users.userFullName, name), eq(users.userIsDeleted, false))).limit(1);
    if(!get_user_by_name) { throw new NotFoundException('Không tìm thấy người dùng'); }
    return get_user_by_name;
  }

  async getQrCode(walletId: string) {
    return `${process.env.SYSTEM_URL}/api/wallets/join/${walletId}`;
  }

  async getWalletById(walletId: string) {
    if(!walletId || !isUuid(walletId)) { throw new BadRequestException('ID không hợp lệ'); }
    const [get_wallet_by_id] = await db.select({
      walletId: wallets.walletId,
      userFullName: users.userFullName,
      walletName: wallets.walletName,
      walletDescription: wallets.walletDescription,
      walletCurrency: wallets.walletCurrency,
      walletCreatedAt: wallets.walletCreatedAt,
      walletCreatedBy: wallets.walletCreatedBy
    }).from(wallets)
    .innerJoin(users, eq(wallets.walletCreatedBy, users.userId))
    .where(and(eq(wallets.walletId, walletId), eq(wallets.walletIsDeleted, false)))
    .limit(1);
    if(!get_wallet_by_id) { throw new NotFoundException('Không tìm thấy ví'); }
    return {...get_wallet_by_id, walletQrCode: await this.getQrCode(get_wallet_by_id.walletId)};
  }
}
