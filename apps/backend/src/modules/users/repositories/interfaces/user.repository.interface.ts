import type { UserRole } from '../../../../common/types/user-role.type';
import { NewUserRow } from '../../../../core/database/schema';
import { User } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.vo';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: Email;
  passwordHash?: string;
  jobTitleId?: string | null;
  role?: UserRole;
  isActive?: boolean;
};

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findAllActive(): Promise<User[]>;
  create(user: NewUserRow): Promise<User>;
  updateById(id: string, payload: UpdateUserPayload): Promise<User | null>;
}
