import { Module } from '@nestjs/common';
import { PasswordHashService } from 'src/common/services/password-hash.service';
import { UserUsecaseModule } from '../user/user-usecase.module';
import { AuthUseCaseService } from './auth.usecase.service';

@Module({
  imports: [UserUsecaseModule],
  providers: [AuthUseCaseService, PasswordHashService],
  exports: [AuthUseCaseService],
})
export class AuthUseCaseModule {}
