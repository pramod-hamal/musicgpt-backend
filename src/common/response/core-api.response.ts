import { ICursorPaginationResult } from '../interface/cursor-pagination.interface';
import { AppCursorPagination, AppResponse } from './app-response';

export abstract class CoreApiResponse {
  constructor() {}
  static success<TData>(data: TData, statusCode: number = 200, message: string = 'success') {
    return new AppResponse({
      data: data,
      statusCode,
      message,
    });
  }

  static successWithErrors<TData>(data: TData, errors: any, statusCode: number = 200, message: string = 'success') {
    return new AppResponse({
      data: data,
      error: errors,
      statusCode,
      message,
    });
  }

  static cursorPagination<T>(
    paginationData: ICursorPaginationResult<T>,
    statusCode: number = 200,
    message: string = 'success',
  ) {
    return new AppCursorPagination(paginationData, statusCode, message);
  }
  //   static pagination(
  //     paginationData: IPaginationData,
  //     query: IPaginationQuery,
  //     statusCode: number = 200,
  //     message: string = 'success',
  //   ) {
  //     return new AppPagination({
  //       ...paginationData,
  //       ...query,
  //       statusCode,
  //       message: message,
  //     });
  //   }
}

export abstract class CoreWsResponse {
  static success<T>(data: T) {
    return {
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
