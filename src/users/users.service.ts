import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { db } from 'src/db/db';
import { users } from 'src/db/schema';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

 async findAll() {
    const find_list_user = await db.select().from(users).limit(10)
    return find_list_user;
  }

  async findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
