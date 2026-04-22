import { HttpException as Exception } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseDto } from 'src/common/type/response';
import { formatErrorMessage } from 'src/common/utils/errorFormater.utils';

const reduceErrors = (errors: ValidationError[]): object => {
  return errors?.reduce((obj, item: any) => {
    if (item.children?.length > 0) {
      obj[item.property] = reduceErrors(item.children);
    } else {
      let error = '';

      if (Array.isArray(Object.values(item?.constraints))) {
        error = Object.values(item?.constraints)[0] as any;
      } else {
        error = Object.values(item?.constraints).toString();
      }
      obj[item.property] = formatErrorMessage(error);
    }
    return obj;
  }, {});
};

export { reduceErrors as reduceErrors };

export class BaseException extends Exception {
  constructor(
    private readonly errors: ValidationError[],
    message: string = 'Validation failed',
    statusCode: number = 400,
  ) {
    const errorsMessages = reduceErrors(errors);
    const responseDto: ResponseDto = {
      statusCode,
      timestamp: new Date().toISOString(),
      message: message,
      error: errorsMessages,
      data: {},
    };
    super(responseDto, statusCode);
  }
}
