import { IAudioRepository } from 'src/core/abstracts/repositories/audio.repository';
import { IPromptRepository } from 'src/core/abstracts/repositories/prompt.repository';
import { IRefreshTokenRepository } from 'src/core/abstracts/repositories/refresh-token.repository';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { PrismaAudioRepository } from '../repositories/prisma-audio.repository';
import { PrismaPromptRepository } from '../repositories/prisma-prompt.repository';
import { PrismaRefreshTokenRepository } from '../repositories/prisma-refresh-token.repository';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { IUnitOfWork } from 'src/core/abstracts/unit-of-work';
import { PrismaUnitOfWork } from '../prisma-unit-of-work';

export const prismaRepositories = [
  {
    provide: IAudioRepository,
    useClass: PrismaAudioRepository,
  },
  {
    provide: IPromptRepository,
    useClass: PrismaPromptRepository,
  },
  {
    provide: IRefreshTokenRepository,
    useClass: PrismaRefreshTokenRepository,
  },
  {
    provide: IUserRepository,
    useClass: PrismaUserRepository,
  },
  {
    provide: IUnitOfWork,
    useClass: PrismaUnitOfWork,
  },
];
