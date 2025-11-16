import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessageService } from '../services/message.service';
import { AuthGuard } from '../auth.guard';

@Controller('messages')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('conversations')
  async createConversation(
    @Request() req: any,
    @Body('postId') postId: string,
  ) {
    return this.messageService.createConversation(req.user.sub, postId);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.messageService.getConversations(req.user.sub);
  }

  @Get('conversations/:id')
  async getConversationById(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.messageService.getConversationById(id, req.user.sub);
  }

  @Get('conversations/:id/messages')
  async getMessages(@Param('id') id: string, @Request() req: any) {
    return this.messageService.getMessages(id, req.user.sub);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Request() req: any,
    @Body('text') text: string,
  ) {
    return this.messageService.sendMessage(id, req.user.sub, text);
  }

  @Post('conversations/:id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.messageService.markAsRead(id, req.user.sub);
  }
}
