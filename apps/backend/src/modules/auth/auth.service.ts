import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { AppConfig } from '../../common/configs/app.config';
import { AuthenticationError } from '../../common/exceptions/authentication.exception';
import { BusinessRuleError } from '../../common/exceptions/business-rule.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../users/repositories/interfaces/user.repository.interface';
import { Email } from '../users/value-objects/email.vo';
import type { LoginDto, RegisterDto } from './dto/auth.schema';
import type { AuthTokenPayload } from '../../common/types/auth-token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
  ) {}

  async register(dto: RegisterDto) {
    const email = new Email(dto.email);

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new BusinessRuleError('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: email.getValue(),
      passwordHash,
      jobTitleId: dto.jobTitleId ?? null,
      role: dto.role,
      isActive: true,
    });

    return {
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email.getValue(),
      jobTitleId: createdUser.jobTitleId,
      role: createdUser.role,
      isActive: createdUser.isActive,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
  }

  async login(dto: LoginDto) {
    const email = new Email(dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email.getValue(),
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.appConfig.jwt.secret,
      expiresIn: this.appConfig.jwt.expiresIn,
    });

    return {
      accessToken,
    };
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

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
}
