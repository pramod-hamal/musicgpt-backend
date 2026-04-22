import { Injectable } from '@nestjs/common';
import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { IPromptRepository } from 'src/core/abstracts/repositories/prompt.repository';
import { PromptModel } from 'src/core/models/prompt.model';
import { Prompt } from 'src/generated/prisma/client';
import { PrismaPromptMapper } from '../mappers/prisma-prompt.mapper';
import { PrismaService } from '../prisma.service';
import { PrismaGenericRepository } from './prisma-generic.repository';

@Injectable()
export class PrismaPromptRepository extends PrismaGenericRepository<PromptModel, Prompt> implements IPromptRepository {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService.prompt, 'prompt', PrismaPromptMapper.toDomain);
  }

  async findPendingPrompts(tx?: any): Promise<PromptModel[]> {
    const prismaDelegate = tx ? tx.prompt : this.prismaService.prompt;
    const pendingPrompts = await prismaDelegate.findMany({
      where: {
        status: PromptStatus.PENDING,
      },
      orderBy: [{ createdAt: 'desc' }, { priority: 'asc' }],
    });
    return pendingPrompts.map(PrismaPromptMapper.toDomain);
  }
}
