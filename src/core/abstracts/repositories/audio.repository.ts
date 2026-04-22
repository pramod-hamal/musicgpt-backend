import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';
import { AudioModel } from 'src/core/models/audio.model';
import { IGenericRepository } from './generic.repository';

export abstract class IAudioRepository extends IGenericRepository<AudioModel> {
  abstract searchAudio(
    query: string,
    options: ICursorPaginationOptions,
    tx?: any,
  ): Promise<ICursorPaginationResult<AudioModel>>;
}
