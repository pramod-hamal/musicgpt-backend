import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ThrottleGuard } from 'src/common/guards/throttle.guard';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { SubscriptionUsecaseService } from 'src/use-cases/subscription/subscription.usecase.service';

@Controller('subscriptions')
@UseGuards(AuthGuard, ThrottleGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionUsecaseService: SubscriptionUsecaseService) {}

  @Post('subscribe')
  async subscribe() {
    return CoreApiResponse.success(await this.subscriptionUsecaseService.subscribe());
  }

  @Post('cancel')
  async cancel() {
    return CoreApiResponse.success(await this.subscriptionUsecaseService.cancel());
  }
}
