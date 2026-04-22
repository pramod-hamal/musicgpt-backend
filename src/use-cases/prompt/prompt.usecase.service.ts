import { Injectable } from '@nestjs/common';
import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import AppException from 'src/common/exception/app.exception';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { IPromptRepository } from 'src/core/abstracts/repositories/prompt.repository';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { PromptModel } from 'src/core/models/prompt.model';
import { UserModel } from 'src/core/models/user.model';
import { CreatePromptDto } from 'src/modules/prompt/dtos/create-prompt.dto';

@Injectable()
export class PromptUsecaseService {
  constructor(
    private readonly promptRepo: IPromptRepository,
    private readonly reqContext: IRequestContextService,
  ) {}

  async createPrompt(dto: CreatePromptDto) {
    const user = this.getContextUser();
    const prompt = new PromptModel({
      userId: user.id,
      text: dto.text,
      status: PromptStatus.PENDING,
      priority: user.subscriptionStatus === SubscriptionStatus.PAID ? 1 : 5,
    });

    return await this.promptRepo.create(prompt);
  }

  async getPrompts(query: ICursorPaginationOptions) {
    return await this.promptRepo.paginateByCursor(query);
  }

  async getPromptById(id: string) {
    const prompt = await this.promptRepo.findById(id);
    if (!prompt) {
      throw new AppException({ id: 'Prompt not found' }, 'Prompt not found', 404);
    }

    const user = this.getContextUser();
    if (prompt.userId !== user.id) {
      throw new AppException({ id: 'Forbidden prompt access' }, 'Forbidden', 403);
    }

    return prompt;
  }

  async deletePrompt(id: string) {
    await this.getPromptById(id);
    await this.promptRepo.delete(id);
  }

  private getContextUser(): UserModel {
    const user = this.reqContext.get<UserModel>('user');
    if (!user) {
      throw new AppException('Invalid User', 'Invalid User', 401);
    }

    return user;
  }
}
