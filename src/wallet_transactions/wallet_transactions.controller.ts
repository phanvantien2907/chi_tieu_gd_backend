import { Controller, Get, Post, Body, Req, UseFilters, UseGuards, Query} from '@nestjs/common';
import { WalletTransactionsService } from './wallet_transactions.service';
import { CreateWalletTransactionDto } from './dto/create-wallet_transaction.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { GuardsGuard } from 'src/guard/guard.guard';
import { PaginationDto } from 'src/utilities/dtos/pagination.dto';

@Controller('wallet-transactions')
 @ApiBearerAuth('access-token')
@ApiTags('Transactions')
 @UseGuards(GuardsGuard)
@UseFilters(CatchEverythingFilter)
export class WalletTransactionsController {
  constructor(private readonly walletTransactionsService: WalletTransactionsService) {}

  @Post('deposit')
  @ApiOperation({summary: 'Khởi tạo yêu cầu nạp tiền', description: 'Khởi tạo yêu cầu nạp tiền vào ví, hệ thống sẽ trả về URL thanh toán để người dùng hoàn tất giao dịch'})
  createtransaction(@Body() createWalletTransactionDto: CreateWalletTransactionDto, @Req() req: Request) {
    const user = req['user'];
    return this.walletTransactionsService.createTransaction(createWalletTransactionDto, user.userId);
  }

  @Get('history-transactions')
  @ApiOperation({summary: 'Lấy lịch sử giao dịch của ví', description: 'Lấy danh sách tất cả các giao dịch đã thực hiện trong ví'})
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
  findAll(@Query() paginationDto: PaginationDto, @Req() req: Request) {
    const user = req['user'];
   return this.walletTransactionsService.findAllTransactions(paginationDto, user.userId);
  }

}
