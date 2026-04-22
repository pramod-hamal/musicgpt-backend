import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from 'src/core/abstracts/repositories/refresh-token.repository';
import { RefreshTokenModel } from 'src/core/models/refresh-token.model';
import { RefreshTokens } from 'src/generated/prisma/client';
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token.mapper';
import { PrismaService } from '../prisma.service';
import { PrismaGenericRepository } from './prisma-generic.repository';
import { rescue } from 'src/common/utils/prisma-rescue.helper';

@Injectable()
export class PrismaRefreshTokenRepository
  extends PrismaGenericRepository<RefreshTokenModel, RefreshTokens>
  implements IRefreshTokenRepository
{
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.refreshTokens, 'refreshTokens', PrismaRefreshTokenMapper.toDomain);
  }

  async revoke(sessionId: string, tx: any = null): Promise<void> {
    return await rescue<void>(async () => {
      const prismaDelegate = tx ? tx.refreshTokens : this.prismaService.refreshTokens;
      await prismaDelegate.update({
        where: { id: sessionId },
        data: { isRevoked: true },
      });
    });
  }
}
