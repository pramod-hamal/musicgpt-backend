import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import { UserModel } from './user.model';

export type PromptModelProps = {
  id?: string;
  userId: string;
  text: string;
  status: PromptStatus;
  user?: UserModel;
  priority: number;
};

export class PromptModel {
  id: string;
  userId: string;
  text: string;
  status: PromptStatus;
  priority: number;
  user?: UserModel;

  constructor(props: PromptModelProps) {
    this.id = props.id || undefined;
    this.userId = props.userId;
    this.text = props.text;
    this.user = props.user;
    this.priority = props.priority;
    this.status = props.status;
  }
}
