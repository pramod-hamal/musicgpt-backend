import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ThrottleGuard } from 'src/common/guards/throttle.guard';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { PromptUsecaseService } from 'src/use-cases/prompt/prompt.usecase.service';
import { CreatePromptDto } from '../dtos/create-prompt.dto';
import { PromptIdParamDto } from '../dtos/prompt-id-param.dto';
import { UpdatePromptDto } from '../dtos/update-prompt.dto';

@Controller('prompts')
@UseGuards(AuthGuard, ThrottleGuard)
export class PromptController {
  constructor(private readonly promptUsecaseService: PromptUsecaseService) {}

  @Post()
  async createPrompt(@Body() dto: CreatePromptDto) {
    return CoreApiResponse.success(await this.promptUsecaseService.createPrompt(dto), 201);
  }

  @Get()
  async getPrompts(@Query() query: ICursorPaginationOptions) {
    return CoreApiResponse.cursorPagination(await this.promptUsecaseService.getPrompts(query));
  }

  @Get(':id')
  async getPromptById(@Param() params: PromptIdParamDto) {
    return CoreApiResponse.success(await this.promptUsecaseService.getPromptById(params.id));
  }

  @Delete(':id')
  async deletePrompt(@Param() params: PromptIdParamDto) {
    await this.promptUsecaseService.deletePrompt(params.id);
    return CoreApiResponse.success({ message: 'Prompt deleted successfully' });
  }
}