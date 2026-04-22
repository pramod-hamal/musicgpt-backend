import { Module } from '@nestjs/common';
import { UserUsecaseModule } from 'src/use-cases/user/user-usecase.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [UserUsecaseModule],
  controllers: [UserController],
})
export class UserModule {}
