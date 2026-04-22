import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { prismaRepositories } from './providers/repo-provider';

@Module({
  providers: [PrismaService, ...prismaRepositories],
  exports: [PrismaService, ...prismaRepositories],
})
export class PrismaModule {}
