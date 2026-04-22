import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';

export abstract class IGenericRepository<T> {
  abstract create(item: T, tx?: any): Promise<T>;
  abstract findById(id: string, tx?: any): Promise<T | null>;
  abstract findAll(tx?: any): Promise<T[]>;
  abstract paginateByCursor(options: ICursorPaginationOptions, tx?: any): Promise<ICursorPaginationResult<T>>;
  abstract update(id: string, item: T, tx?: any): Promise<T>;
  abstract delete(id: string, tx?: any): Promise<void>;
}
