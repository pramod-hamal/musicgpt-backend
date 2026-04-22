import { Injectable } from '@nestjs/common';
import { ICursorPaginationOptions, ICursorPaginationResult } from 'src/common/interface/cursor-pagination.interface';
import { decodeBase64, encodeBase64 } from 'src/common/utils/encode-decode-base64.utils';
import { rescue } from 'src/common/utils/prisma-rescue.helper';
import { IGenericRepository } from 'src/core/abstracts/repositories/generic.repository';
import { Prisma } from 'src/generated/prisma/client';

type PrismaDelegate<TPrisma> = {
  create(args: { data: any }): Promise<TPrisma>;
  findUnique(args: { where: { id: string } }): Promise<TPrisma | null>;
  findMany(args?: { where?: any; orderBy?: any; skip?: number; take?: number }): Promise<TPrisma[]>;
  update(args: { where: { id: string }; data: any }): Promise<TPrisma>;
  delete(args: { where: { id: string } }): Promise<TPrisma>;
};

@Injectable()
export class PrismaGenericRepository<TModel, TPrisma> extends IGenericRepository<TModel> {
  protected readonly DEFAULT_LIMIT = 20;

  constructor(
    private readonly prismaModel: PrismaDelegate<TPrisma>,
    private readonly prismaModelKey: string,
    private readonly toDomain: (item: TPrisma) => TModel,
  ) {
    super();
  }

  private getDelegate(tx: any = null): PrismaDelegate<TPrisma> {
    if (!tx) return this.prismaModel;

    const delegate = tx[this.prismaModelKey];
    if (!delegate) {
      throw new Error(`Prisma delegate '${this.prismaModelKey}' not found on transaction client`);
    }

    return delegate as PrismaDelegate<TPrisma>;
  }

  async create(item: TModel, tx: any = null): Promise<TModel> {
    return await rescue<TModel>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      const created = await prismaDelegate.create({ data: item });
      return this.toDomain(created);
    });
  }

  async findById(id: string, tx: any = null): Promise<TModel | null> {
    return await rescue<TModel | null>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      const found = await prismaDelegate.findUnique({ where: { id } });
      return found ? this.toDomain(found) : null;
    });
  }

  async findAll(tx: any = null): Promise<TModel[]> {
    return await rescue<TModel[]>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      const rows = await prismaDelegate.findMany();
      return rows.map((row) => this.toDomain(row));
    });
  }

  async paginateByCursor(options: ICursorPaginationOptions, tx: any = null): Promise<ICursorPaginationResult<TModel>> {
    return await rescue<ICursorPaginationResult<TModel>>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      const { limit, sortOrder, operator, cursor } = this.getCursorPaginationQueryParam(options);
      let where = {};

      if (cursor) {
        where = {
          ...where,
          createdAt: { [operator]: new Date(cursor) },
        };
      }
      const rows = await prismaDelegate.findMany({
        where,
        take: limit + 1, // fetch one extra item to check if there is a next page
        orderBy: { createdAt: sortOrder },
      });

      const { nextCursor, prevCursor } = this.getPaginationCursor(options, rows, limit, sortOrder);
      if (sortOrder === 'asc') rows.reverse(); // if we fetched in asc order for prev page, reverse to maintain consistency
      const data = rows.map((row) => this.toDomain(row));
      return {
        data,
        nextCursor: nextCursor ? encodeBase64(nextCursor.toISOString()) : null,
        prevCursor: prevCursor ? encodeBase64(prevCursor.toISOString()) : null,
      };
    });
  }

  async update(id: string, item: TModel, tx: any = null): Promise<TModel> {
    return await rescue<TModel>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      const updated = await prismaDelegate.update({
        where: { id },
        data: item,
      });
      return this.toDomain(updated);
    });
  }

  async delete(id: string, tx: any = null): Promise<void> {
    return await rescue<void>(async () => {
      const prismaDelegate = this.getDelegate(tx);
      await prismaDelegate.delete({ where: { id } });
    });
  }

  protected getCursorPaginationQueryParam(query: ICursorPaginationOptions) {
    const limit = query.limit || this.DEFAULT_LIMIT;
    let sortOrder: Prisma.SortOrder = 'desc';
    let operator: string = 'lt';
    let cursor = query?.nextCursor;

    if (query.prevCursor) {
      sortOrder = 'asc';
      operator = 'gt';
      cursor = query.prevCursor;
    }

    return { limit, sortOrder, operator, cursor: cursor ? decodeBase64(cursor) : null };
  }

  protected getPaginationCursor(
    query: ICursorPaginationOptions,
    entities: TPrisma[],
    limit: number,
    sortOrder: string,
  ) {
    /**
     * if we have more results than the limit,
     * It means there is a next page, so there is next cursor.
     */
    const hasMoreResults = entities.length > limit;

    if (hasMoreResults) entities.pop(); // remove the extra item we fetched to check for more results

    let nextCursor: Date | null = null;
    let prevCursor: Date | null = null;

    if (!entities.length) return { nextCursor, prevCursor };

    if (sortOrder === 'desc' && hasMoreResults) {
      nextCursor = entities[entities.length - 1]['createdAt'] as Date;
    }

    if (sortOrder === 'desc' && query.nextCursor) {
      prevCursor = entities[0]['createdAt'] as Date;
    }

    if (sortOrder === 'asc' && hasMoreResults) {
      prevCursor = entities[entities.length - 1]['createdAt'] as Date;
    }

    if (sortOrder === 'asc' && query.prevCursor) {
      nextCursor = entities[0]['createdAt'] as Date;
    }

    return { nextCursor, prevCursor };
  }
}
