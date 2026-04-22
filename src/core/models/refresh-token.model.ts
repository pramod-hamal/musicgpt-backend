
export type RefreshTokenModelProps = {
  id?: string;
  userId: string;
  token: string;
  isRevoked: boolean;
};

export class RefreshTokenModel {
  id: string;
  userId: string;
  token: string;
  isRevoked: boolean;

  constructor(props: RefreshTokenModelProps) {
    this.id = props.id || undefined;
    this.userId = props.userId;
    this.token = props.token;
    this.isRevoked = props.isRevoked;
  }
}
