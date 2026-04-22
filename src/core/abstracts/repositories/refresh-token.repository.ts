import { RefreshTokenModel } from 'src/core/models/refresh-token.model';
import { IGenericRepository } from './generic.repository';

export abstract class IRefreshTokenRepository extends IGenericRepository<RefreshTokenModel> {
  abstract revoke(sessionId: string): Promise<void>;
}
