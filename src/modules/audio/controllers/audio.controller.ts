import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ThrottleGuard } from 'src/common/guards/throttle.guard';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { AudioUsecaseService } from 'src/use-cases/audio/audio.usecase.service';
import { AudioIdParamDto } from '../dtos/audio-id-param.dto';
import { CreateAudioDto } from '../dtos/create-audio.dto';
import { UpdateAudioDto } from '../dtos/update-audio.dto';

@Controller('audios')
@UseGuards(AuthGuard, ThrottleGuard)
export class AudioController {
  constructor(private readonly audioUsecaseService: AudioUsecaseService) {}

  @Get()
  async getAudios(@Query() query: ICursorPaginationOptions) {
    return CoreApiResponse.cursorPagination(await this.audioUsecaseService.getAudios(query));
  }

  @Get(':id')
  async getAudioById(@Param() params: AudioIdParamDto) {
    return CoreApiResponse.success(await this.audioUsecaseService.getAudioById(params.id));
  }

  @Patch(':id')
  async updateAudio(@Param() params: AudioIdParamDto, @Body() dto: UpdateAudioDto) {
    return CoreApiResponse.success(await this.audioUsecaseService.updateAudio(params.id, dto));
  }

}