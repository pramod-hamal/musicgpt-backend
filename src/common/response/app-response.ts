import { ICursorPaginationOptions, ICursorPaginationResult } from '../interface/cursor-pagination.interface';
import { IPaginationData } from '../interface/response-data.interface';
import { IResponseResult } from '../interface/response.result.interface';

export class AppResponse<ResponseEntity> {
  public statusCode: number;
  public message: string;
  public data: ResponseEntity;
  public timestamp: Date;
  public error?: any;

  constructor(paginationResults: IResponseResult<ResponseEntity>) {
    this.statusCode = paginationResults.statusCode;
    this.timestamp = new Date();
    this.message = paginationResults.message;
    this.data = paginationResults.data;
    this.error = paginationResults.error;
  }
}

export function emptyPaginationData(): IPaginationData<any> {
  return {
    data: [],
    warnings: null,
    total: 0,
    limit: 0,
    page: 0,
    previous: null,
    next: null,
  };
}

export class AppCursorPagination<PaginationEntity> {
  public statusCode: number;
  public message: string;
  public data: PaginationEntity[];
  public meta: any;

  constructor(
    paginationResults: ICursorPaginationResult<PaginationEntity>,
    statusCode: number = 200,
    message: string = 'success',
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = paginationResults.data;
    this.meta = {
      nextCursor: paginationResults.nextCursor,
      prevCursor: paginationResults.prevCursor,
    };
  }
}
