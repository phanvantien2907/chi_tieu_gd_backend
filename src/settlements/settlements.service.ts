import { Injectable } from '@nestjs/common';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';

@Injectable()
export class SettlementsService {
  create(createSettlementDto: CreateSettlementDto) {
    return 'This action adds a new settlement';
  }

  findAll() {
    return `This action returns all settlements`;
  }

  findOne(id: number) {
    return `This action returns a #${id} settlement`;
  }

  update(id: number, updateSettlementDto: UpdateSettlementDto) {
    return `This action updates a #${id} settlement`;
  }

  remove(id: number) {
    return `This action removes a #${id} settlement`;
  }
}
