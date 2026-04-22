import { Injectable } from '@nestjs/common';
import { PromptStatus } from 'src/common/enum/prompt-status.enum';
import AppException from 'src/common/exception/app.exception';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';
import { IAudioRepository } from 'src/core/abstracts/repositories/audio.repository';
import { IPromptRepository } from 'src/core/abstracts/repositories/prompt.repository';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { AudioModel } from 'src/core/models/audio.model';
import { PromptModel } from 'src/core/models/prompt.model';
import { UserModel } from 'src/core/models/user.model';
import { CreateAudioDto } from 'src/modules/audio/dtos/create-audio.dto';
import { UpdateAudioDto } from 'src/modules/audio/dtos/update-audio.dto';

@Injectable()
export class AudioUsecaseService {
  constructor(
    private readonly audioRepo: IAudioRepository,
    private readonly promptRepo: IPromptRepository,
    private readonly reqContext: IRequestContextService,
  ) {}

  async createAudio(dto: CreateAudioDto) {
    const prompt = await this.getOwnedPromptById(dto.promptId);

    const audio = new AudioModel({
      promptId: dto.promptId,
      url: dto.url,
      title: dto.title,
      prompt,
    });

    return await this.audioRepo.create(audio);
  }

  async getAudios(query: ICursorPaginationOptions) {
    const paginatedAudios = await this.audioRepo.paginateByCursor(query);

    return paginatedAudios;
  }

  async getAudioById(id: string) {
    const audio = await this.audioRepo.findById(id);
    if (!audio) {
      throw new AppException({ id: 'Audio not found' }, 'Audio not found', 404);
    }

    const user = this.getContextUser();
    if (audio.prompt?.userId !== user.id) {
      throw new AppException({ id: 'Forbidden audio access' }, 'Forbidden', 403);
    }

    return audio;
  }

  async updateAudio(id: string, dto: UpdateAudioDto) {
    const audio = await this.getAudioById(id);
    audio.url = dto.url ?? audio.url;

    return await this.audioRepo.update(id, audio);
  }

  async deleteAudio(id: string) {
    await this.getAudioById(id);
    await this.audioRepo.delete(id);
  }

  async processAudioGeneration(delay: number, prompt: PromptModel) {
    const generationSimulation = new Promise((resolve) => setTimeout(resolve, 4000));
    await generationSimulation;
    await this.audioRepo.create(
      new AudioModel({
        promptId: prompt.id,
        url: 'https://example.com/audio.mp3',
        title: `Audio for prompt ${prompt.id}`,
      }),
    );

    await this.promptRepo.update(prompt.id, { status: PromptStatus.COMPLETED } as PromptModel);
  }

  private async getOwnedPromptById(id: string): Promise<PromptModel> {
    const prompt = await this.promptRepo.findById(id);
    if (!prompt) {
      throw new AppException({ promptId: 'Prompt not found' }, 'Prompt not found', 404);
    }

    const user = this.getContextUser();
    if (prompt.userId !== user.id) {
      throw new AppException({ promptId: 'Forbidden prompt access' }, 'Forbidden', 403);
    }

    return prompt;
  }

  private getContextUser(): UserModel {
    const user = this.reqContext.get<UserModel>('user');
    if (!user) {
      throw new AppException('Invalid User', 'Invalid User', 401);
    }

    return user;
  }
}
