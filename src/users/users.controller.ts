import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from 'src/guard/role.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';

@Controller('users')
@ApiBearerAuth('access-token')
@UseGuards(new RoleGuard(['admin']))
@UseFilters(CatchEverythingFilter)
@ApiTags('Users')
export class UsersController {
constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả người dùng' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Lấy thông tin người dùng theo ID'})
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({summary: 'Cập nhật thông tin người dùng theo ID'})
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('delete/:id')
  @ApiOperation({summary: 'Xóa người dùng theo ID'})
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
