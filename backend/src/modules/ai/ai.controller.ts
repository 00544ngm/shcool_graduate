import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSearchDto } from './dto/ai-search.dto';
import { AiChatDto } from './dto/ai-chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('search')
  search(@Body() dto: AiSearchDto) {
    return this.aiService.search(dto.query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  chat(
    @Body() dto: AiChatDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.aiService.chat(user.id, dto.message);
  }
}
