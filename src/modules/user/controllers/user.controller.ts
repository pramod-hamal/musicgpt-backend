import { Body, Controller, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { UserUsecaseService } from 'src/use-cases/user/user-usecase.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserIdParamDto } from '../dtos/user-id-param.dto';
import { ThrottleGuard } from 'src/common/guards/throttle.guard';

@Controller('users')
@UseGuards(AuthGuard, ThrottleGuard)
export class UserController {
  constructor(private readonly userUsecaseService: UserUsecaseService) {}

  @Get()
  async getUser(@Query() query: ICursorPaginationOptions) {
    return CoreApiResponse.cursorPagination(await this.userUsecaseService.getUser(query));
  }

  @Get(':id')
  async getUserById(@Param() params: UserIdParamDto) {
    return CoreApiResponse.success(await this.userUsecaseService.getUserById(params.id));
  }

  @Patch(':id')
  async updateDisplayName(@Param() params: UserIdParamDto, @Body() dto: UpdateUserDto) {
    return CoreApiResponse.success(await this.userUsecaseService.updateUser(params.id, dto));
  }
}
