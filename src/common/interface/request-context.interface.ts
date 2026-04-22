import { UserModel } from 'src/core/models/user.model';

export interface IRequestContext {
  sessionId?: string;
  accessId?: string;
  user?: UserModel;
}
