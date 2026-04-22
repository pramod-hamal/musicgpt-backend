import { AudioModel } from 'src/core/models/audio.model';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaPromptMapper } from './prisma-prompt.mapper';

type AudioWithPrompt = Prisma.AudioGetPayload<{ include: { prompt: true } }>;
export class PrismaAudioMapper {
  static toDomain(prismaAudio: AudioWithPrompt): AudioModel {
    const audioModel = new AudioModel({
      id: prismaAudio.id,
      promptId: prismaAudio.promptId,
      url: prismaAudio.url,
      prompt: prismaAudio.prompt ? PrismaPromptMapper.toDomain(prismaAudio.prompt) : null,
      title: prismaAudio.title,
    });
    return audioModel;
  }
}
