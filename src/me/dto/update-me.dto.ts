import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateMeDto  {
        @ApiPropertyOptional({description: 'Email của người dùng', example: 'phanvantien@dhv.com'})
        @IsOptional()
        @IsEmail({}, {message: 'Email không hợp lệ'})
        user_email?: string;

        @IsString({message: 'Họ tên phải là chuỗi ký tự'})
        @IsOptional()
        @MinLength(3, { message: 'Họ và tên phải có ít nhất 3 ký tự' })
        @ApiPropertyOptional({description: 'Họ và tên của người dùng', example: 'Phan Van Tien'})
        user_full_name: string;

        @ApiPropertyOptional({description: 'URL ảnh đại diện của người dùng', example: 'https://example.com/avatar.jpg'})
        @IsOptional()
        @IsString({message: 'URL ảnh đại diện phải là chuỗi ký tự'})
        user_avatar_url?: string;
}
