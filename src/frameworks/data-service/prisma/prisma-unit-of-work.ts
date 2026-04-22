import { Injectable } from '@nestjs/common';
import { IUnitOfWork } from 'src/core/abstracts/unit-of-work';
import { PrismaService } from './prisma.service';
import AppException from 'src/common/exception/app.exception';

@Injectable()
export class PrismaUnitOfWork implements IUnitOfWork {
  constructor(private readonly prismaService: PrismaService) {}
  async execute<T>(work: (tx: unknown) => Promise<T>): Promise<T> {
    try {
      return await this.prismaService.$transaction(async (prismaTx) => {
        return await work(prismaTx);
      });
    } catch (error) {
      console.log('Transaction Error:', error);
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException('Something Went Wrong', '', 500);
    }
  }
}
