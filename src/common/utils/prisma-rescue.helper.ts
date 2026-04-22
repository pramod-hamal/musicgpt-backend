import { Prisma } from 'src/generated/prisma/client';
import AppException from '../exception/app.exception';

export async function rescue<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapPrismaError(error);
  }
}

export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new AppException('Resource already exists', '', 409);

      case 'P2025':
        throw new AppException('Resource not found', '', 404);

      case 'P2003':
        throw new AppException('Invalid foreign key', '', 400);

      default:
        throw new AppException(`Database error: ${error.code}`, '', 500);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new AppException('Invalid query data', '', 400);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new AppException('Database connection failed', '', 500);
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new AppException('Database engine crashed', '', 500);
  }

  throw error;
}
