export abstract class ITokenBlacklistRepository {
  abstract has(jti: string): Promise<boolean>;
  abstract add(jti: string, exp: number): Promise<void>;
}
