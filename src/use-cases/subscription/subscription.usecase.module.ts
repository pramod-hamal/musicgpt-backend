import { Module } from '@nestjs/common';
import { SubscriptionUsecaseService } from './subscription.usecase.service';

@Module({
  imports: [],
  providers: [SubscriptionUsecaseService],
  exports: [SubscriptionUsecaseService],
})
export class SubscriptionUsecaseModule {}