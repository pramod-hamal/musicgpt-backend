import { IError } from '../type/iError';
import { BaseException } from './base.exception';

export default class AppException extends BaseException {
  constructor(appErrors: IError | string = {}, message: string = 'Invalid data', status: number = 400) {
    if (typeof appErrors === 'string') {
      super([], appErrors, status);
      return;
    }

    const toCamelCase = (str: string): string => {
      return str
        .split('_')
        .map((word, index) =>
          index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
    };

    const errorsMessages = Object.keys(appErrors).map((key) => {
      const camelCaseKey = toCamelCase(key);
      return {
        target: { key: camelCaseKey },
        property: camelCaseKey,
        constraints: {
          key: appErrors[key],
        },
        value: camelCaseKey,
      };
    });
    super(errorsMessages, message, status);
  }
}
