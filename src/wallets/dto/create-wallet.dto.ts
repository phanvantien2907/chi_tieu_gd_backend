import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateWalletDto {
    @IsString({message: 'Tên ví phải là chuỗi ký tự'})
    @IsNotEmpty({message: 'Tên ví không được để trống'})
    @MinLength(3, {message: 'Tên ví phải có ít nhất 3 ký tự'})
    @ApiProperty({ example: 'Ví chi tiêu nhà Tiến', description: 'Tên của ví' })
    walletName: string;

    @IsString()
    @ApiPropertyOptional({ example: 'Ví dùng để chi tiêu cho gia đình', description: 'Mô tả của ví' })
    @IsOptional()
    walletDescription?: string;

    @IsString()
    @ApiPropertyOptional({ example: 'VND', description: 'Đơn vị tiền tệ của ví' })
    @IsOptional()
    walletCurrency?: string;

    @IsString()
    @IsNotEmpty({message: 'Người tạo ví không được để trống'})
    @ApiProperty({example: 'Phan Văn Tiến', description: 'Người tạo ví'})
    walletCreatedBy: string;
}
