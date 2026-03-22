import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  users,
  type NewUserRow,
  type UserRow,
} from '../../../core/database/schema';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import {
  type IUserRepository,
  type UpdateUserPayload,
} from './interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async findByEmail(email: Email): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.getValue()))
      .limit(1);

    if (!row || row.deletedAt !== null) {
      return null;
    }

    return this.toDomain(row);
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row || row.deletedAt !== null) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAllActive(): Promise<User[]> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(isNull(users.deletedAt), eq(users.isActive, true)));

    return rows.map((row) => this.toDomain(row));
  }

  async create(user: NewUserRow): Promise<User> {
    const [createdRow] = await this.db.insert(users).values(user).returning();

    if (!createdRow) {
      throw new Error('User creation failed');
    }

    return this.toDomain(createdRow);
  }

  async updateById(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<User | null> {
    const hasNoFields = Object.keys(payload).length === 0;

    if (hasNoFields) {
      return this.findById(id);
    }

    const [updatedRow] = await this.db
      .update(users)
      .set({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email?.getValue(),
        passwordHash: payload.passwordHash,
        jobTitleId: payload.jobTitleId,
        role: payload.role,
        isActive: payload.isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  private toDomain(row: UserRow): User {
    return new User({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: new Email(row.email),
      passwordHash: row.passwordHash,
      jobTitleId: row.jobTitleId ?? null,
      role: row.role,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }
}