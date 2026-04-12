import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangePasswordDTO {
  @IsString({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @ApiProperty({
    description: 'Nhập email của bạn',
    example: 'tiendeptrai@gmail.com',
  })
  email: string;
}
