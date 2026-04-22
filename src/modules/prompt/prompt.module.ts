import { Module } from '@nestjs/common';
import { PromptController } from './controllers/prompt.controller';
import { PromptUsecaseModule } from 'src/use-cases/prompt/prompt.usecase.module';

@Module({
  imports: [PromptUsecaseModule],
  controllers: [PromptController],
})
export class PromptModule {}