import { Injectable } from '@nestjs/common';
import { CreateWalletMemberDto } from './dto/create-wallet_member.dto';
import { UpdateWalletMemberDto } from './dto/update-wallet_member.dto';

@Injectable()
export class WalletMembersService {
  create(createWalletMemberDto: CreateWalletMemberDto) {
    return 'This action adds a new walletMember';
  }

  findAll() {
    return `This action returns all walletMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} walletMember`;
  }

  update(id: number, updateWalletMemberDto: UpdateWalletMemberDto) {
    return `This action updates a #${id} walletMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} walletMember`;
  }
}
