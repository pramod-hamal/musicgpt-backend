import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAudioDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  url?: string;
}
