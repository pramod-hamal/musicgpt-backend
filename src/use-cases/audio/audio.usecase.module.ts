import { Module } from '@nestjs/common';
import { AudioUsecaseService } from './audio.usecase.service';

@Module({
  imports: [],
  providers: [AudioUsecaseService],
  exports: [AudioUsecaseService],
})
export class AudioUsecaseModule {}