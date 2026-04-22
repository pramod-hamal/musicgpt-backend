import { Injectable } from '@nestjs/common';
import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import { UserModel } from 'src/core/models/user.model';
import { ICacheService } from '../../core/abstracts/cache.service';

interface ThrottleState {
  requestCount: number;
  lastRequestAt: number;
  blockedUntil?: number;
}

@Injectable()
export class ThrottleUsecaseService {
  private readonly timeWindowMs: number;
  private readonly blockDurationMs: number;

  constructor(private readonly cacheService: ICacheService) {
    this.timeWindowMs = 60 * 1000;
    this.blockDurationMs = parseInt(process.env.THROTTLE_BLOCK_DURATION_MS || '60000', 10);
  }

  async isUserRateLimited(user: UserModel): Promise<boolean> {
    let maxRequestPerMinute = parseInt(process.env.DEFAULT_RATE_LIMIT || '10', 10);
    if (user.subscriptionStatus === SubscriptionStatus.PAID) {
      maxRequestPerMinute = parseInt(process.env.PAID_USER_RATE_LIMIT || '100', 10);
    }

    const now = Date.now();
    const key = this.getThrottleKey(user.id);
    const throttleState = await this.cacheService.get<ThrottleState>(key);

    if (!throttleState) {
      await this.cacheService.set<ThrottleState>(
        key,
        {
          requestCount: 1,
          lastRequestAt: now,
        },
        Math.ceil(this.timeWindowMs / 1000),
      );

      return false;
    }

    if (throttleState.blockedUntil && now < throttleState.blockedUntil) {
      return true;
    }

    if (now - throttleState.lastRequestAt >= this.timeWindowMs) {
      await this.cacheService.set<ThrottleState>(
        key,
        {
          requestCount: 1,
          lastRequestAt: now,
        },
        Math.ceil(this.timeWindowMs / 1000),
      );

      return false;
    }

    const updatedCount = throttleState.requestCount + 1;

    if (updatedCount > maxRequestPerMinute) {
      await this.cacheService.set<ThrottleState>(
        key,
        {
          requestCount: updatedCount,
          lastRequestAt: now,
          blockedUntil: now + this.blockDurationMs,
        },
        Math.ceil(this.blockDurationMs / 1000),
      );

      return true;
    }

    await this.cacheService.set<ThrottleState>(
      key,
      {
        requestCount: updatedCount,
        lastRequestAt: now,
      },
      Math.ceil(this.timeWindowMs / 1000),
    );

    return false;
  }

  private getThrottleKey(userId: string): string {
    return `throttle:${userId}`;
  }
}
