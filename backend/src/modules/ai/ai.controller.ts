import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSearchDto } from './dto/ai-search.dto';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('search')
  search(@Body() dto: AiSearchDto) {
    return this.aiService.search(dto.query);
  }
}
