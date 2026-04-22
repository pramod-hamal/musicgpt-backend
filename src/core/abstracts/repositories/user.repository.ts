import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';
import { UserModel } from 'src/core/models/user.model';
import { IGenericRepository } from './generic.repository';

export abstract class IUserRepository extends IGenericRepository<UserModel> {
  //   abstract hardDelete(id: string): Promise<void>;
  abstract findByEmail(email: string, tx?: any): Promise<UserModel | null>;
  abstract searchUsers(
    query: string,
    options: ICursorPaginationOptions,
    tx?: any,
  ): Promise<ICursorPaginationResult<UserModel>>;
}
