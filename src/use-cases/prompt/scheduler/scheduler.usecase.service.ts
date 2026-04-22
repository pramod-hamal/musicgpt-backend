import { Injectable } from '@nestjs/common';
import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { IJobQueue } from 'src/core/abstracts/job-queue';
import { IPromptRepository } from 'src/core/abstracts/repositories/prompt.repository';
import { PromptModel } from 'src/core/models/prompt.model';

@Injectable()
export class PromptSchedulerService {
  constructor(
    private readonly promptRepository: IPromptRepository,
    private readonly jobQueue: IJobQueue,
  ) {}

  async addPromptsToJob(): Promise<void> {
    const pendingPrompts = await this.promptRepository.findPendingPrompts();

    if (pendingPrompts.length === 0) {
      return;
    }

    for (const prompt of pendingPrompts) {
      console.log(`Adding prompt with ID ${prompt.id} to the job queue`);
      await this.jobQueue.addPromptJob('process-prompt', prompt);
      await this.promptRepository.update(prompt.id, { status: PromptStatus.PROCESSING } as PromptModel);
    }
  }
}
