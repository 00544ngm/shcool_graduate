import { Module } from '@nestjs/common';
import { HomeMessageController } from './home-message.controller';
import { HomeMessageService } from './home-message.service';

@Module({
  controllers: [HomeMessageController],
  providers: [HomeMessageService],
  exports: [HomeMessageService],
})
export class HomeMessageModule {}
