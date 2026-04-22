import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CoreApiResponse } from 'src/common/response/core-api.response';
import { SearchUsecaseService } from 'src/use-cases/search/search.usecase.service';
import { SearchQueryDto } from '../dtos/search-query.dto';

@Controller('search')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchUsecaseService: SearchUsecaseService) {}

  @Get()
  async search(@Query() query: SearchQueryDto) {
    const result = await this.searchUsecaseService.search(query);
    return CoreApiResponse.success(result);
  }
}
