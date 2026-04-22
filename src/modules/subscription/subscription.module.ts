import { Module } from '@nestjs/common';
import { SubscriptionUsecaseModule } from 'src/use-cases/subscription/subscription.usecase.module';
import { SubscriptionController } from './controllers/subscription.controller';

@Module({
  imports: [SubscriptionUsecaseModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}