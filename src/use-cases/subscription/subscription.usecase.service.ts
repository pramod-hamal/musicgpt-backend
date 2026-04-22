import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import AppException from 'src/common/exception/app.exception';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { UserModel } from 'src/core/models/user.model';

@Injectable()
export class SubscriptionUsecaseService {
  constructor(
    private readonly reqContext: IRequestContextService,
    private readonly userRepo: IUserRepository,
  ) {}

  async subscribe() {
    const user = this.reqContext.get<UserModel>('user');
    if (!user) {
      throw new AppException('Invalid User', 'Invalid User', 401);
    }
    await this.userRepo.update(user.id, {
      subscriptionStatus: SubscriptionStatus.PAID,
    } as UserModel);

    return 'Subscribed Successfully.';
  }

  async cancel() {
    const context = this.reqContext.get<UserModel>('user');
    const user = await this.userRepo.findById(context.id);

    if (user.subscriptionStatus === SubscriptionStatus.FREE) {
      throw new AppException("Haven't subscribed to cancel");
    }
    if (!user) {
      throw new AppException('Invalid User', 'Invalid User', 401);
    }
    await this.userRepo.update(user.id, {
      subscriptionStatus: SubscriptionStatus.FREE,
    } as UserModel);
  }
}
