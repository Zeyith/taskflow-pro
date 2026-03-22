import type { UserRole } from './common';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitleId: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  accessToken: string;
};

export type MeResponseData = AuthUser;