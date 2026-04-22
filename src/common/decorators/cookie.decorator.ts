import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Cookies = createParamDecorator((key: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  if (!key) {
    return request.cookies;
  }

  return request.cookies?.[key];
});
