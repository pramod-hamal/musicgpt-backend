import { Global, Module } from '@nestjs/common';
import { ThrottleUsecaseService } from './throttle-usecase.service';

@Global()
@Module({
  imports: [],
  providers: [ThrottleUsecaseService],
  exports: [ThrottleUsecaseService],
})
export class ThrottleUseCaseModule {}
