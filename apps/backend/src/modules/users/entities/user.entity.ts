import type { UserRole } from '../../../common/types/user-role.type';
import { Email } from '../value-objects/email.vo';

export type CreateUserProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: Email;
  passwordHash: string;
  jobTitleId: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class User {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: Email;
  readonly passwordHash: string;
  readonly jobTitleId: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: CreateUserProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.jobTitleId = props.jobTitleId;
    this.role = props.role;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isTeamLead(): boolean {
    return this.role === 'TEAM_LEAD';
  }

  isEmployee(): boolean {
    return this.role === 'EMPLOYEE';
  }
}
