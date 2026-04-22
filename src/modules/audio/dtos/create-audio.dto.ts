import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAudioDto {
  @IsUUID()
  @IsNotEmpty()
  promptId: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

}