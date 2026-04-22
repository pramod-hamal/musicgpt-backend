import { Global, Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { IRequestContextService } from 'src/core/abstracts/request-context';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      guard: {
        mount: true,
      },
    }),
  ],
  providers: [
    {
      provide: IRequestContextService,
      useClass: RequestContextService,
    },
  ],
  exports: [IRequestContextService],
})
export class ContextModule {}
