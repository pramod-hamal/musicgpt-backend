export abstract class IRequestContextService {
  abstract get<T = any>(key: string): T | undefined;
  abstract set<T = any>(key: string, value: T): void;
}
