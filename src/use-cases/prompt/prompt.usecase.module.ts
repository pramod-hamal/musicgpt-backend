import { Module } from '@nestjs/common';
import { PromptUsecaseService } from './prompt.usecase.service';

@Module({
  imports: [],
  providers: [PromptUsecaseService],
  exports: [PromptUsecaseService],
})
export class PromptUsecaseModule {}
