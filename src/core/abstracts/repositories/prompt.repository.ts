import { PromptModel } from 'src/core/models/prompt.model';
import { IGenericRepository } from './generic.repository';

export abstract class IPromptRepository extends IGenericRepository<PromptModel> {
  abstract findPendingPrompts(tx?: any): Promise<PromptModel[]>;
}
