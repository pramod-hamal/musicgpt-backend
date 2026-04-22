import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import AppException from 'src/common/exception/app.exception';
import { PasswordHashService } from 'src/common/services/password-hash.service';
import { IRefreshTokenRepository } from 'src/core/abstracts/repositories/refresh-token.repository';
import { ITokenBlacklistRepository } from 'src/core/abstracts/repositories/token-blacklist.repository';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { IUnitOfWork } from 'src/core/abstracts/unit-of-work';
import { RefreshTokenModel } from 'src/core/models/refresh-token.model';
import { UserModel } from 'src/core/models/user.model';
import { LoginDto } from 'src/modules/auth/dtos/login.dto';
import { RegisterDto } from 'src/modules/auth/dtos/register.dto';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthUseCaseService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHashService: PasswordHashService,
    private readonly refreshTokenRepo: IRefreshTokenRepository,
    private readonly jwtService: JwtService,
    private readonly unitofWork: IUnitOfWork,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistRepo: ITokenBlacklistRepository,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (user) {
      throw new AppException({ email: 'User already exists' }, 'Email already exists', 409);
    }
    const hashedPassword = await this.passwordHashService.hashPassword(dto.password);
    const userModel = new UserModel({
      email: dto.email,
      password: hashedPassword,
      displayName: dto.displayName,
      subscriptionStatus: SubscriptionStatus.FREE,
    });

    const createdUser = await this.userRepo.create(userModel);
    delete createdUser.password;
    return createdUser;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new AppException({ email: 'User not found' }, 'User not found', 404);
    }
    const isPasswordValid = await this.passwordHashService.comparePassword(dto.password, user.password);
    if (!isPasswordValid) {
      throw new AppException({ password: 'Invalid password' }, 'Invalid password', 401);
    }
    const refreshTokenPayload = {
      sub: user.email,
    };

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: `${this.configService.get<string>('JWT_REFRESH_SECRET')}s`,
      expiresIn: `${this.configService.get<number>('JWT_REFRESH_EXPIRES_IN')}s`,
    });

    /**
     * TODO: Max refresh tokens per user, invalidate old refresh tokens, etc.
     */
    const result = await this.unitofWork.execute(async (tx) => {
      const refreshTokenModel = new RefreshTokenModel({
        userId: user.id,
        token: refreshToken,
        isRevoked: false,
      });
      const createdRefreshToken = await this.refreshTokenRepo.create(refreshTokenModel, tx);
      const accessTokenPayload = {
        sub: user.email,
        // sessionId: createdRefreshToken.id,
        jti: uuidv4(),
      };
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: `${this.configService.get<number>('JWT_EXPIRES_IN')}s`,
      });

      return {
        accessToken: accessToken,
        refreshToken: createdRefreshToken,
      };
    });
    delete user.password;
    return {
      accessToken: result.accessToken,
      sessionId: result.refreshToken.id,
      user: user,
    };
  }

  async logout(sessionId: string, tokenId: string) {
    const session = await this.refreshTokenRepo.findById(sessionId);
    if (!session) {
      throw new AppException({ sessionId: 'Invalid session' }, 'Invalid session', 401);
    }
    await this.refreshTokenRepo.revoke(sessionId);
    const accessTokenExp = Number(this.configService.get<number>('JWT_EXPIRES_IN') || 900);
    await this.tokenBlacklistRepo.add(sessionId, accessTokenExp);
    return session;
  }

  async refreshToken(sessionId: string) {
    if (!sessionId) {
      throw new AppException({ sessionId: 'Session ID is required' }, 'Session ID is required', 401);
    }
    const refreshToken = await this.refreshTokenRepo.findById(sessionId);
    if (!refreshToken || refreshToken.isRevoked) {
      throw new AppException({ sessionId: 'Invalid session' }, 'Invalid session', 401);
    }

    const user = await this.userRepo.findById(refreshToken.userId);
    if (!user) {
      throw new AppException({ user: 'User not found' }, 'User not found', 401);
    }

    const accessTokenPayload = {
      sub: user.email,
      // sessionId: refreshToken.id,
      jti: uuidv4(),
    };
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: `${this.configService.get<string>('JWT_SECRET')}`,
      expiresIn: `${this.configService.get<number>('JWT_EXPIRES_IN')}s`,
    });

    delete user.password;
    return {
      user: user,
      accessToken,
    };
  }
}
