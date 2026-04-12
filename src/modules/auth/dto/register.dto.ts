import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { RoleType } from 'src/modules/users/enums/user-role.enums.';

export class RegisterDTO {
  @ApiProperty({
    description: 'Email của người dùng',
    example: 'phanvantien@example.com',
  })
  @IsString({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  userEmail!: string;

  @IsString({ message: 'Họ và tên không được để trống' })
  @MinLength(3, { message: 'Họ và tên phải có ít nhất 3 ký tự' })
  @ApiProperty({
    description: 'Họ và tên của người dùng',
    example: 'Phan Van Tien',
  })
  userFullName!: string;

  @IsString({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: 'password123',
  })
  userHashedPassword!: string;

  @ApiProperty({
    description: 'Vai trò của người dùng',
    example: RoleType.CLIENT,
    enum: RoleType,
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  @IsEnum(RoleType, {
    message: `Vai trò không hợp lệ, chỉ chấp nhận các giá trị: ${Object.values(RoleType).join(', ')}`,
  })
  userRole!: RoleType;
}
