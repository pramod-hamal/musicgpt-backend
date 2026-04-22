import { SubscriptionStatus } from 'src/common/enum/subscription-status.enum';

export type UserModelProps = {
  id?: string;
  email: string;
  password: string;
  displayName: string;
  subscriptionStatus: SubscriptionStatus;
};

export class UserModel {
  id: string;
  email: string;
  password: string;
  displayName: string;
  subscriptionStatus: SubscriptionStatus;

  constructor(props: UserModelProps) {
    this.id = props.id || undefined;
    this.email = props.email;
    this.password = props.password;
    this.displayName = props.displayName;
    this.subscriptionStatus = props.subscriptionStatus;
  }
}
