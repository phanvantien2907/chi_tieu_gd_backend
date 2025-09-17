import { ApiProperty } from "@nestjs/swagger";

export class CreateWalletTransactionDto {
    @ApiProperty({example: 'Ví chi tiêu nhà Tiến', description: 'Tên ví'})
    transactionWalletId: string;
    @ApiProperty({example: 100000, description: 'Số tiền giao dịch'})
    transactionAmount: number;
    @ApiProperty({example: 'VNPAY', description: 'Nhà cung cấp giao dịch'})
    transactionProvider: string;
}
