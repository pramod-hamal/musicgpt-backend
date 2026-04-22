import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ICursorPaginationOptions {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  nextCursor?: string;
  @IsOptional()
  prevCursor?: string;
}

export interface ICursorPaginationResult<T> {
  data: T[];
  prevCursor: string | null;
  nextCursor: string | null;
}
