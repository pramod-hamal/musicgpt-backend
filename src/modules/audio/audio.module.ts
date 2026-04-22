import { Module } from '@nestjs/common';
import { AudioController } from './controllers/audio.controller';
import { AudioUsecaseModule } from 'src/use-cases/audio/audio.usecase.module';

@Module({
  imports: [AudioUsecaseModule],
  controllers: [AudioController],
})
export class AudioModule {}