import { Injectable } from '@nestjs/common';
import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';
import { encodeBase64 } from 'src/common/utils/encode-decode-base64.utils';
import { rescue } from 'src/common/utils/prisma-rescue.helper';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { UserModel } from 'src/core/models/user.model';
import { User } from 'src/generated/prisma/client';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { PrismaService } from '../prisma.service';
import { PrismaGenericRepository } from './prisma-generic.repository';

export interface UserFilter {
  email?: string;
  isActive?: boolean;
}

@Injectable()
export class PrismaUserRepository extends PrismaGenericRepository<UserModel, User> implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.user, 'user', PrismaUserMapper.toDomain);
  }

  async findByEmail(email: string, tx: any = null): Promise<UserModel | null> {
    return await rescue<UserModel | null>(async () => {
      const prismaDelegate = tx ? tx.user : this.prismaService.user;
      const found = await prismaDelegate.findUnique({ where: { email } });
      return found ? PrismaUserMapper.toDomain(found) : null;
    });
  }

  async searchUsers(
    query: string,
    options: ICursorPaginationOptions,
    tx: any = null,
  ): Promise<ICursorPaginationResult<UserModel>> {
    return await rescue<ICursorPaginationResult<UserModel>>(async () => {
      const prismaDelegate = tx ? tx.user : this.prismaService.user;
      const { limit, sortOrder, operator, cursor } = this.getCursorPaginationQueryParam(options);
      let where: any = {
        displayName: {
          contains: query,
          mode: 'insensitive',
        },
      };

      if (cursor) {
        where = {
          ...where,
          createdAt: { [operator]: new Date(cursor) },
        };
      }
      const rows = await prismaDelegate.findMany({
        where,
        take: limit + 1, // fetch one extra item to check if there is a next page
        orderBy: { createdAt: sortOrder },
      });

      const { nextCursor, prevCursor } = this.getPaginationCursor(options, rows, limit, sortOrder);
      if (sortOrder === 'asc') rows.reverse();
      const data = rows.map((row) => PrismaUserMapper.toDomain(row));
      return {
        data,
        nextCursor: nextCursor ? encodeBase64(nextCursor.toISOString()) : null,
        prevCursor: prevCursor ? encodeBase64(prevCursor.toISOString()) : null,
      };
    });
  }
}
