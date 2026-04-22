import { IsUUID } from 'class-validator';

export class AudioIdParamDto {
  @IsUUID()
  id: string;
}