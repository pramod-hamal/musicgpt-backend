import { RefreshTokenModel } from 'src/core/models/refresh-token.model';
import { RefreshTokens } from 'src/generated/prisma/client';

export class PrismaRefreshTokenMapper {
  static toDomain(prismaRefreshToken: RefreshTokens): RefreshTokenModel {
    const refreshTokenModel = new RefreshTokenModel({
      id: prismaRefreshToken.id,
      userId: prismaRefreshToken.userId,
      token: prismaRefreshToken.token,
      isRevoked: prismaRefreshToken.isRevoked,
    });
    return refreshTokenModel;
  }
}