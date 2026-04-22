import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePromptDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}