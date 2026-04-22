import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { PromptModel } from 'src/core/models/prompt.model';
import { Prisma, Prompt } from 'src/generated/prisma/client';
import { PrismaUserMapper } from './prisma-user.mapper';

type PromptWithUser = Prisma.PromptGetPayload<{ include: { user: true } }>;
export class PrismaPromptMapper {
  static toDomain(prismaPrompt: Prompt | PromptWithUser): PromptModel {
    const promptModel = new PromptModel({
      id: prismaPrompt.id,
      userId: prismaPrompt.userId,
      text: prismaPrompt.text,
      status: prismaPrompt.status as PromptStatus,
      priority: prismaPrompt.priority,
      user: (prismaPrompt as PromptWithUser).user
        ? PrismaUserMapper.toDomain((prismaPrompt as PromptWithUser).user)
        : undefined,
    });
    return promptModel;
  }
}
