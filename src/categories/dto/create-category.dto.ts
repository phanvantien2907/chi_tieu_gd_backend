import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty({message: 'Tên ví không được để trống!'})
    @ApiProperty({example: 'Ví chi tiêu gia đình', description: 'Tên của ví'})
     @IsString({message: 'Tên ví phải là một chuỗi!'})
     @MinLength(3, {message: 'Tên ví phải có ít nhất 3 ký tự!'})
    categoryWalletId: string;

    @IsNotEmpty({message: 'Tên danh mục không được để trống!'})
    @ApiProperty({example: 'Ăn uống', description: 'Tên của danh mục'})
    @IsString({message: 'Tên danh mục phải là một chuỗi!'})
    @MinLength(3, {message: 'Tên danh mục phải có ít nhất 3 ký tự!'})
    categoryName: string;

    @IsOptional()
    @ApiPropertyOptional({example: 'icon.jpg', description: 'Icon của danh mục'})
    categoryIcon?: string;
}
