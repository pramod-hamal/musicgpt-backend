import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';
import { UserModel } from 'src/core/models/user.model';
import { User } from 'src/generated/prisma/client';

export class PrismaUserMapper {
  static toDomain(prismaUser: User): UserModel {
    const userModel = new UserModel({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      displayName: prismaUser.displayName,
      subscriptionStatus: prismaUser.subscriptionStatus as SubscriptionStatus,
    });
    return userModel;
  }
}
