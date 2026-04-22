import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter, log: ['info', 'warn', 'error'], errorFormat: 'pretty' });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`; // Test the connection
      this.logger.log('PrismaService has connected to the database');
    } catch (error) {
      console.log('Error connecting to the database:', error);
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
