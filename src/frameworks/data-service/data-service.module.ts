import { DynamicModule, Module } from '@nestjs/common';
import { IDatabaseOptions } from 'src/common/interface/database.options.interface';
import { PrismaModule } from './prisma/prisma.module';

@Module({})
export class DataServiceModule {
  static async register(option: IDatabaseOptions): Promise<DynamicModule> {
    return {
      global: true,
      module: DataServiceModule,
      imports: [PrismaModule],
      exports: [PrismaModule],
    };
  }
}
