import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateExpenseSplitsDto {
    @IsString({message: 'Tên con nợ phải là chuỗi ký tự'})
    @IsNotEmpty({message: 'Tên con nợ không được để trống'})
    @MinLength(3, {message: 'Tên con nợ phải có ít nhất 3 ký tự'})
    @ApiProperty({example: 'Phan Văn Tiến', description: 'Tên con nợ'})
    splitUserId: string;
}