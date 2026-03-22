import type { UserRole } from './user-role.type';

export type AuthenticatedUser = {
  sub: string;
  email: string;
  role: UserRole;
};
