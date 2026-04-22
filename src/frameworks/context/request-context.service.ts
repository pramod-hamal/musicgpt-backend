import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { IRequestContextService } from 'src/core/abstracts/request-context';

@Injectable()
export class RequestContextService implements IRequestContextService {
  constructor(private readonly cls: ClsService<any>) {}
  get<T = any>(key: string): T | undefined {
    return this.cls.get(key);
  }

  set<T = any>(key: string, value: T): void {
    this.cls.set(key, value);
  }
}
