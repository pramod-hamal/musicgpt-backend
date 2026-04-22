import { Socket } from 'socket.io';
import { UserModel } from 'src/core/models/user.model';

export type AuthPayload = {
  user: UserModel;
};

export type SocketWithAuth = Socket & AuthPayload;
