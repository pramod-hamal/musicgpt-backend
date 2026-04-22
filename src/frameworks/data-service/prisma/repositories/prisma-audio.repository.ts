import { Injectable } from '@nestjs/common';
import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';
import { encodeBase64 } from 'src/common/utils/encode-decode-base64.utils';
import { rescue } from 'src/common/utils/prisma-rescue.helper';
import { IAudioRepository } from 'src/core/abstracts/repositories/audio.repository';
import { AudioModel } from 'src/core/models/audio.model';
import { Audio, Prisma } from 'src/generated/prisma/client';
import { PrismaAudioMapper } from '../mappers/prisma-audio.mapper';
import { PrismaService } from '../prisma.service';
import { PrismaGenericRepository } from './prisma-generic.repository';

type AudioWithPrompt = Prisma.AudioGetPayload<{ include: { prompt: true } }>;

@Injectable()
export class PrismaAudioRepository extends PrismaGenericRepository<AudioModel, Audio> implements IAudioRepository {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.audio, 'audio', (item) => PrismaAudioMapper.toDomain(item as AudioWithPrompt));
  }
  async searchAudio(
    query: string,
    options: ICursorPaginationOptions,
    tx: any = null,
  ): Promise<ICursorPaginationResult<AudioModel>> {
    return await rescue<ICursorPaginationResult<AudioModel>>(async () => {
      const prismaDelegate = tx ? tx.audio : this.prismaService.audio;
      const { limit, sortOrder, operator, cursor } = this.getCursorPaginationQueryParam(options);
      let where: any = {
        title: {
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
      const data = rows.map((row) => PrismaAudioMapper.toDomain(row));
      return {
        data,
        nextCursor: nextCursor ? encodeBase64(nextCursor.toISOString()) : null,
        prevCursor: prevCursor ? encodeBase64(prevCursor.toISOString()) : null,
      };
    });
  }
}
