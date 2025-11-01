import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class UpdateRoleWalletMemberDto {
     @IsNotEmpty({message: 'Tên ví không được để trống!'})
    @ApiProperty({example: 'Ví chi tiêu gia đình', description: 'Tên của ví'})
    @IsString({message: 'Tên ví phải là một chuỗi!'})
    @MinLength(3, {message: 'Tên ví phải có ít nhất 3 ký tự!'})
    memberWalletId: string;

    @IsNotEmpty({message: 'Tên người dùng không được để trống!'})
    @ApiProperty({example: 'Phan Văn Tiến', description: 'Tên của người dùng'})
    @IsString({message: 'Tên người dùng phải là một chuỗi!'})
    @MinLength(3, {message: 'Tên người dùng phải có ít nhất 3 ký tự!'})
    memberNewAdmin: string;
}