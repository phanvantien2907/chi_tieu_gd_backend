import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginrDTO {
    @ApiProperty({description: 'Email của người dùng', example: 'phanvantien@example.com'})
    @IsString({message: 'Email không được để trống'})
    @IsEmail({}, {message: 'Email không hợp lệ'})
    user_email: string;

     @ApiProperty({description: 'Mật khẩu', example: 'password123'})
     @IsString({message: 'Mật khẩu không được để trống'})
    @MinLength(6, {message: 'Mật khẩu phải có ít nhất 6 ký tự'})
    user_hashed_password: string;
}