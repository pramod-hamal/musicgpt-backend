import { Module } from '@nestjs/common';
import { AuthUseCaseModule } from 'src/use-cases/auth/auth.usecase.module';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [AuthUseCaseModule],
  controllers: [AuthController],
})
export class AuthModule {}
