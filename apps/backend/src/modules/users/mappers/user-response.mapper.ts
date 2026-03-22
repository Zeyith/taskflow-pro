import type { UserRole } from '../../../common/types/user-role.type';
import type { User } from '../entities/user.entity';

export type UserResponseDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitleId: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export function toUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email.getValue(),
    jobTitleId: user.jobTitleId,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
