import { PromptModelProps } from '../models/prompt.model';

export abstract class IJobQueue {
  abstract addPromptJob(jobName: string, data: PromptModelProps): Promise<void>;
}
