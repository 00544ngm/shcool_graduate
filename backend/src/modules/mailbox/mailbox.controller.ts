import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { MailboxService } from './mailbox.service';
import { CreateLetterDto } from './dto/create-letter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('mailbox')
export class MailboxController {
  constructor(private mailboxService: MailboxService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateLetterDto, @CurrentUser() user: { id: string }) {
    return this.mailboxService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  myLetters(@CurrentUser() user: { id: string }) {
    return this.mailboxService.findMyLetters(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('opened')
  openedLetters(@CurrentUser() user: { id: string }) {
    return this.mailboxService.findOpened(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/open')
  openLetter(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.mailboxService.openLetter(id, user.id);
  }
}
