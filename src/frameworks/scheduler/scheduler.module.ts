import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ISchedulerService } from 'src/core/abstracts/schedule';
import { PromptSchedulerUseCaseModule } from 'src/use-cases/prompt/scheduler/scheduler.usecase.module';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [PromptSchedulerUseCaseModule, ScheduleModule.forRoot()],
  providers: [
    {
      provide: ISchedulerService,
      useClass: SchedulerService,
    },
  ],
  exports: [ISchedulerService],
})
export class SchedulerModule {}
