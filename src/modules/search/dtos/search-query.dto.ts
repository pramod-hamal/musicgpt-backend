import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ICursorPaginationOptions } from 'src/common/interface/cursor-pagination.interface';

export class SearchQueryDto extends ICursorPaginationOptions {
  @IsNotEmpty()
  @IsString()
  q: string;

  @IsOptional()
  @IsString()
  nextUserCursor?: string;

  @IsOptional()
  @IsString()
  nextAudioCursor?: string;

  @IsOptional()
  @IsString()
  prevUserCursor?: string;

  @IsOptional()
  @IsString()
  prevAudioCursor?: string;
}
