import { Injectable } from '@nestjs/common';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { IAudioRepository } from 'src/core/abstracts/repositories/audio.repository';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { SearchQueryDto } from 'src/modules/search/dtos/search-query.dto';

@Injectable()
export class SearchUsecaseService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly audio: IAudioRepository,
  ) {}

  async search(query: SearchQueryDto) {
    const limit = query.limit || 20;
    const userPaginationOptions: ICursorPaginationOptions = {
      limit,
      nextCursor: query.nextUserCursor,
      prevCursor: query.prevUserCursor,
    };
    const audioPaginationOptions: ICursorPaginationOptions = {
      limit,
      nextCursor: query.nextAudioCursor,
      prevCursor: query.prevAudioCursor,
    };
    const [users, audios] = await Promise.all([
      this.userRepo.searchUsers(query.q, userPaginationOptions),
      this.audio.searchAudio(query.q, audioPaginationOptions),
    ]);

    return {
      users,
      audios,
    };
  }
}
