import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDTO {
  @IsString()
  @ApiProperty({description: 'Mật khẩu cũ', example: '123456'})
  oldPassword: string;

  @IsString()
  @ApiProperty({description: 'Mật khẩu mới', example: 'abcdef'})
  @MinLength(6, {message: 'Mật khẩu phải có ít nhất 6 ký tự'})
  newPassword: string;
}