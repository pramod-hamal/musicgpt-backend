import { Module } from '@nestjs/common';
import { SearchUsecaseModule } from 'src/use-cases/search/search.usecase.module';
import { SearchController } from './controllers/search.controller';

@Module({
  imports: [SearchUsecaseModule],
  controllers: [SearchController],
})
export class SearchModule {}
