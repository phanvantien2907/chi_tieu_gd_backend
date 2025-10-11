import { Controller, Get, Post, Body, Patch, UseGuards, Req, UseFilters, Query, Param } from '@nestjs/common';
import { MeService } from './me.service';
import { GuardsGuard } from 'src/guard/guard.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UpdateMeDto } from 'src/me/dto/update-me.dto';
import { ChangePasswordDTO } from 'src/me/dto/chage-password.dto';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { CreateExpenseDto } from 'src/expenses/dto/create-expense.dto';
import { CreateWalletTransactionDto } from 'src/me/dto/create-wallet_transaction.dto';
import { PaginationDto } from 'src/utilities/dtos/pagination.dto';

@Controller('me')
@ApiTags("Me")
@UseGuards(GuardsGuard)
@UseFilters(CatchEverythingFilter)
@ApiBearerAuth('access-token')
export class MeController {
  constructor(private readonly meService: MeService) {}


  @Get()
  @ApiOperation({ summary: 'Trang cá nhân của tôi' })
  me( @Req() req: Request) {
  const user = req['user'];
   return this.meService.me(user.userId);
  }

  @Get('get-expenses')
  @ApiOperation({summary: 'Lấy tất cả các khoản chi tiêu của tôi' })
  findAllExpense(@Req() req: Request) {
    const user = req['user'];
    return this.meService.findAllExpense(user.userId);
  }

  @Post('create-expense')
  @ApiOperation({summary: 'Thanh toán khoản chi tiêu mới' })
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Req() req: Request) {
  const user = req['user'];
  return this.meService.createExpense(createExpenseDto, user.userId);
  }

   @Get('total-balance')
  @ApiOperation({ summary: 'Số dư trong ví của tôi' })
  totalBalance(@Req() req: Request) {
    const user = req['user'];
    return this.meService.TotalBalance(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  update(@Body() UpdateMeDto: UpdateMeDto, @Req() req: Request) {
    const user = req['user'];
    return this.meService.update(UpdateMeDto, user.userId);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Cập nhật mật khẩu' })
  updatePassword(@Body() ChangePasswordDTO: ChangePasswordDTO, @Req() req: Request) {
    const user = req['user'];
    return this.meService.updatePassword(ChangePasswordDTO, user.userId);
  }

    @Post('create-deposit')
    @ApiOperation({summary: 'Nạp tiền vào tài khoản', description: 'Khởi tạo yêu cầu nạp tiền vào ví, hệ thống sẽ trả về URL thanh toán để người dùng hoàn tất giao dịch'})
    createtransaction(@Body() createWalletTransactionDto: CreateWalletTransactionDto, @Req() req: Request) {
      const user = req['user'];
      return this.meService.createTransaction(createWalletTransactionDto, user.userId);
    }

    @Get('history-transactions')
    @ApiOperation({summary: 'Lấy lịch sử giao dịch trong ví', description: 'Lấy danh sách tất cả các giao dịch đã thực hiện trong ví của tôi'})
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Số trang (mặc định: 1)' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
    findAll(@Query() paginationDto: PaginationDto, @Req() req: Request) {
    const user = req['user'];
     return this.meService.findAllTransactions(paginationDto, user.userId);
    }

    @Get('list-debit')
    @ApiOperation({ summary: 'Lấy danh sách khoản nợ của tôi' })
    findListDebit(@Req() req: Request) {
      const user = req['user'];
      return this.meService.getListDebit(user.userId);
    }

    @Get('list-user-debit')
    @ApiOperation({ summary: 'Lấy danh sách người đang nợ của tôi' })
    findListUserDebit(@Req() req: Request) {
      const user = req['user'];
      return this.meService.getListUserDebit(user.userId);
    }

    @Patch('pay-debit/:id')
    @ApiOperation({ summary: 'Thanh toán khoản nợ của tôi' })
    payDebit(@Param('id') id: string, @Req() req: Request) {
      const user = req['user'];
      return this.meService.payDebit(user.userId, id);
    }

    @Patch('delete-account')
    @ApiOperation({ summary: 'Xoá tài khoản của tôi' })
    remove( @Req() req: Request) {
      const user = req['user'];
      return this.meService.deleteAccount(user.userId);
    }

}
