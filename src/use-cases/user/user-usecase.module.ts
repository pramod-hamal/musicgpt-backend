import { Module } from '@nestjs/common';
import { UserUsecaseService } from './user-usecase.service';

@Module({
  imports: [],
  providers: [UserUsecaseService],
  exports: [UserUsecaseService],
})
export class UserUsecaseModule {}
