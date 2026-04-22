import { Module } from '@nestjs/common';
import { PromptSchedulerService } from './scheduler.usecase.service';

@Module({
  exports: [PromptSchedulerService],
  providers: [PromptSchedulerService],
})
export class PromptSchedulerUseCaseModule {}
