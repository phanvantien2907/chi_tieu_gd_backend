import { PartialType } from '@nestjs/swagger';
import { CreateWalletMemberDto } from './create-wallet_member.dto';

export class UpdateWalletMemberDto extends PartialType(CreateWalletMemberDto) {}
