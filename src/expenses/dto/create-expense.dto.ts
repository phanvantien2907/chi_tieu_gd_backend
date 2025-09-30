import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, Min, MinLength } from "class-validator";
import { CreateExpenseSplitsDto } from "./expense-splits.dto";

export class CreateExpenseDto {
    @IsString({message: 'Tên ví phải là chuỗi ký tự'})
    @IsNotEmpty({message: 'Tên ví không được để trống'})
    @MinLength(3, {message: 'Tên ví phải có ít nhất 3 ký tự'})
    @ApiProperty({example: 'Sổ tiết kiệm đen của Mậm', description: 'Tên ví'})
    expenseWalletId: string;

    @IsString({message: 'Mô tả chi tiêu phải là chuỗi ký tự'})
    @IsNotEmpty({message: 'Mô tả chi tiêu không được để trống'})
    @MinLength(3, {message: 'Mô tả chi tiêu phải có ít nhất 3 ký tự'})
    @ApiProperty({example: 'Tiền ăn đêm', description: 'Mô tả chi tiêu'})
    expenseDescription: string;

    @IsNotEmpty({message: 'Số tiền chi tiêu không được để trống'})
    @Min(1000, {message: 'Số tiền chi tiêu phải lớn hơn hoặc bằng 1000'})
    @ApiProperty({example: 50000, description: 'Số tiền chi tiêu'})
    expenseAmount: number;

    @IsArray({message: 'Danh sách chia chi tiêu phải là một mảng'})
    @ArrayMinSize(1, {message: 'Danh sách chia chi tiêu phải có ít nhất một phần tử'})
    @ApiProperty({
        example: [{splitUserId: 'Nguyễn Đình Quảng'}, {splitUserId: 'Đặng Thị Hải Quý'}],
        description: 'Danh sách thành viên chia chi tiêu (không bao gồm người trả)'
    })
    expense_splits: CreateExpenseSplitsDto[];
}
