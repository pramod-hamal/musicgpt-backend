import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ISchedulerService } from 'src/core/abstracts/schedule';
import { PromptSchedulerService } from 'src/use-cases/prompt/scheduler/scheduler.usecase.service';

@Injectable()
export class SchedulerService implements ISchedulerService {
  constructor(private readonly promptSchedulerService: PromptSchedulerService) {}
  /**
   * runs every 5 seconds
   */
  @Cron('*/5 * * * * *')
  async schedulePromptExecution(): Promise<void> {
    await this.promptSchedulerService.addPromptsToJob();
  }
}
