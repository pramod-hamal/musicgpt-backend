import { Injectable } from '@nestjs/common';
import AppException from 'src/common/exception/app.exception';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { IUserRepository } from 'src/core/abstracts/repositories/user.repository';
import { UpdateUserDto } from 'src/modules/user/dtos/update-user.dto';

@Injectable()
export class UserUsecaseService {
  constructor(private readonly userRepo: IUserRepository) {}

  async getUser(query: ICursorPaginationOptions) {
    const users = await this.userRepo.paginateByCursor({
      limit: query.limit,
      nextCursor: query.nextCursor,
      prevCursor: query.prevCursor,
    });
    if (!users) {
      throw new AppException('Failed to fetch users', 'USER_FETCH_ERROR');
    }

     users.data.forEach((user) => {
      delete user.password;
    });

    return users;
  }

  async getUserById(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppException({ id: 'User not found' }, 'User not found', 404);
    }

    delete user.password;
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new AppException({ id: 'User not found' }, 'User not found', 404);
    }

    user.displayName = dto.displayName;

    const updatedUser = await this.userRepo.update(id, user);
    delete updatedUser.password;

    return updatedUser;
  }
}
