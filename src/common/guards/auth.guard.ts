import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IRefreshTokenRepository } from 'src/core/abstracts/repositories/refresh-token.repository';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ITokenBlacklistRepository } from 'src/core/abstracts/repositories/token-blacklist.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private _jwtService: JwtService,
    private _reflector: Reflector,
    private readonly userRepo: IUserRepository,
    private readonly blacklistRepo: ITokenBlacklistRepository,
    private readonly reqContext: IRequestContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    /**
     * if the route is marked as public, then we don't need to check for authentication, just return true.
     */
    if (isPublic) {
      return true;
    }

    const sessionId = request.cookies?.['sessionId'];
    const token = this.extractTokenFromHeader(request);

    if (!token || !sessionId) {
      return false;
    }

    /**
     * now check if the token is valid and not expired,
     * and also check if the user exists in the database. If all checks pass, return true, otherwise return false.
     */

    const decoded = this._jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    /**
     * check if the token is blacklisted, if yes, return false.
     */
    const isBlacklisted = await this.blacklistRepo.has(sessionId);
    if (isBlacklisted) {
      console.log('Token is Blacklisted.');
      return false;
    }
    const user = await this.userRepo.findByEmail(decoded.sub);
    if (!user) {
      return false;
    }
    this.reqContext.set('user', user);
    this.reqContext.set('sessionId', sessionId);
    this.reqContext.set('accessId', decoded.jti);
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
