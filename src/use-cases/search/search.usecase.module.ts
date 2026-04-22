import { Module } from '@nestjs/common';
import { SearchUsecaseService } from './search.usecase.service';

@Module({
  imports: [],
  providers: [SearchUsecaseService],
  exports: [SearchUsecaseService],
})
export class SearchUsecaseModule {}
