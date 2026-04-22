import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { IJobQueue } from 'src/core/abstracts/job-queue';
import { PromptModel } from 'src/core/models/prompt.model';
import { AUDIO_QUEUE } from './queues';

@Injectable()
export class BullmqService implements IJobQueue {
  constructor(@InjectQueue(AUDIO_QUEUE) private readonly audioQueue: Queue) {}

  async addPromptJob(jobName: string, data: PromptModel): Promise<void> {
    await this.audioQueue.add(jobName, data, {
      priority: data.priority || 5, // Default priority is 1 if not provided
    });
  }
}
