import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { BusinessRuleError } from '../../common/exceptions/business-rule.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  JOB_TITLE_REPOSITORY,
  type IJobTitleRepository,
} from '../job-titles/repositories/interfaces/job-title.repository.interface';
import type {
  ChangeOwnPasswordBodyDto,
  UpdateUserProfileBodyDto,
  UpdateUserRoleBodyDto,
  UpdateUserStatusBodyDto,
} from './dto/user-validation.schema';
import type { User } from './entities/user.entity';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from './repositories/interfaces/user.repository.interface';
import { Email } from './value-objects/email.vo';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(JOB_TITLE_REPOSITORY)
    private readonly jobTitleRepository: IJobTitleRepository,
  ) {}

  async findAll(actor: AuthenticatedUser): Promise<User[]> {
    this.ensureTeamLead(actor);

    return this.userRepository.findAllActive();
  }

  async updateProfile(
    targetUserId: string,
    actor: AuthenticatedUser,
    body: UpdateUserProfileBodyDto,
  ): Promise<User> {
    this.ensureSelfOrTeamLead(targetUserId, actor);

    const existingUser = await this.userRepository.findById(targetUserId);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    let nextEmail: Email | undefined;

    if (body.email !== undefined) {
      nextEmail = new Email(body.email);

      const userWithSameEmail =
        await this.userRepository.findByEmail(nextEmail);

      if (userWithSameEmail && userWithSameEmail.id !== targetUserId) {
        throw new BusinessRuleError('Email is already in use');
      }
    }

    if (body.jobTitleId !== undefined && body.jobTitleId !== null) {
      const jobTitle = await this.jobTitleRepository.findById(body.jobTitleId);

      if (!jobTitle) {
        throw new NotFoundError('Job title not found');
      }
    }

    const updatedUser = await this.userRepository.updateById(targetUserId, {
      firstName: body.firstName,
      lastName: body.lastName,
      email: nextEmail,
      jobTitleId: body.jobTitleId,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async changeOwnPassword(
    targetUserId: string,
    actor: AuthenticatedUser,
    body: ChangeOwnPasswordBodyDto,
  ): Promise<User> {
    if (actor.sub !== targetUserId) {
      throw new AuthorizationError('You can only change your own password');
    }

    const existingUser = await this.userRepository.findById(targetUserId);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      body.currentPassword,
      existingUser.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BusinessRuleError('Current password is incorrect');
    }

    const newPasswordMatchesOld = await bcrypt.compare(
      body.newPassword,
      existingUser.passwordHash,
    );

    if (newPasswordMatchesOld) {
      throw new BusinessRuleError(
        'New password must be different from current password',
      );
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 10);

    const updatedUser = await this.userRepository.updateById(targetUserId, {
      passwordHash,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async resetPassword(
    targetUserId: string,
    actor: AuthenticatedUser,
    newPassword: string,
  ): Promise<User> {
    this.ensureTeamLead(actor);

    const existingUser = await this.userRepository.findById(targetUserId);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    const newPasswordMatchesOld = await bcrypt.compare(
      newPassword,
      existingUser.passwordHash,
    );

    if (newPasswordMatchesOld) {
      throw new BusinessRuleError(
        'New password must be different from current password',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await this.userRepository.updateById(targetUserId, {
      passwordHash,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async updateRole(
    targetUserId: string,
    actor: AuthenticatedUser,
    body: UpdateUserRoleBodyDto,
  ): Promise<User> {
    this.ensureTeamLead(actor);

    const existingUser = await this.userRepository.findById(targetUserId);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (existingUser.role === body.role) {
      return existingUser;
    }

    const updatedUser = await this.userRepository.updateById(targetUserId, {
      role: body.role,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async updateStatus(
    targetUserId: string,
    actor: AuthenticatedUser,
    body: UpdateUserStatusBodyDto,
  ): Promise<User> {
    this.ensureTeamLead(actor);

    const existingUser = await this.userRepository.findById(targetUserId);

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    if (existingUser.isActive === body.isActive) {
      return existingUser;
    }

    const updatedUser = await this.userRepository.updateById(targetUserId, {
      isActive: body.isActive,
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  private ensureTeamLead(actor: AuthenticatedUser): void {
    if (actor.role !== 'TEAM_LEAD') {
      throw new AuthorizationError('Only team leads can perform this action');
    }
  }

  private ensureSelfOrTeamLead(
    targetUserId: string,
    actor: AuthenticatedUser,
  ): void {
    const isSelf = actor.sub === targetUserId;
    const isTeamLead = actor.role === 'TEAM_LEAD';

    if (!isSelf && !isTeamLead) {
      throw new AuthorizationError('You are not allowed to update this user');
    }
  }
}
