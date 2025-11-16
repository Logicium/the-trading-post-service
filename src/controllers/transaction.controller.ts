import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { AuthGuard } from '../auth.guard';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(
    @Request() req: any,
    @Body('postId') postId: string,
    @Body('providerId') providerId: string,
    @Body('receiverId') receiverId: string,
    @Body('hours') hours: number,
  ) {
    return this.transactionService.createTransaction(
      req.user.sub,
      postId,
      providerId,
      receiverId,
      hours,
    );
  }

  @Get()
  async getUserTransactions(@Request() req: any) {
    return this.transactionService.getUserTransactions(req.user.sub);
  }

  @Get(':id')
  async getTransactionById(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.getTransactionById(id, req.user.sub);
  }

  @Post(':id/confirm')
  async confirmTransaction(@Param('id') id: string, @Request() req: any) {
    return this.transactionService.confirmTransaction(id, req.user.sub);
  }
}
