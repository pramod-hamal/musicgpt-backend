import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { UserModel } from 'src/core/models/user.model';
import { ThrottleUsecaseService } from 'src/use-cases/throttle/throttle-usecase.service';
import AppException from '../exception/app.exception';

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly reqContext: IRequestContextService,
    private readonly throttleUseCaseService: ThrottleUsecaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user = this.reqContext.get<UserModel>('user');
    if (!user) {
      throw new AppException('Unauthorized', '', 401);
    }

    const isRateLimited = await this.throttleUseCaseService.isUserRateLimited(user);
    if (isRateLimited) {
      throw new AppException('Too many requests. Try again in 1 minute.', 'THROTTLE_LIMIT_EXCEEDED', 429);
    }

    return true;
  }
}
