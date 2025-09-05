import { IsString, MinLength } from "class-validator";

export class ResetPasswordDTO {
    @IsString({ message: 'Mật khẩu mới không được để trống' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    newPassword: string;
}
