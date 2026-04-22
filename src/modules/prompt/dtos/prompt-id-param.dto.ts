import { IsUUID } from 'class-validator';

export class PromptIdParamDto {
  @IsUUID()
  id: string;
}