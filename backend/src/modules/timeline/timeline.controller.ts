import { Controller, Get } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private timelineService: TimelineService) {}

  @Get()
  getTimeline() {
    return this.timelineService.getTimeline();
  }
}
