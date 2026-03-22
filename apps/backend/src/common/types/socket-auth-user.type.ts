import type { UserRole } from './user-role.type';

export type SocketAuthUser = Readonly<{
  sub: string;
  email: string;
  role: UserRole;
}>;
