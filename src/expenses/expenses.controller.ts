import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CatchEverythingFilter } from 'src/exeption/http-exception.filter';
import { GuardsGuard } from 'src/guard/guard.guard';

@Controller('expenses')
@ApiBearerAuth('access-token')
@ApiTags('Expenses')
@UseGuards(GuardsGuard)
@UseFilters(CatchEverythingFilter)
export class ExpensesController {
constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: Request) {
    const user = req['user'];
    return this.expensesService.create(createExpenseDto, user.userId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req['user'];
    return this.expensesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
