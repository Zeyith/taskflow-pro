import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import {
  LoginBodySwaggerSchema,
  LoginSuccessSwaggerSchema,
  MeSuccessSwaggerSchema,
  RegisterBodySwaggerSchema,
  RegisterSuccessSwaggerSchema,
  loginSchema,
  registerSchema,
} from './dto/auth.schema';
import type { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with Team Lead or Employee role.',
  })
  @ApiBody({
    schema: RegisterBodySwaggerSchema,
  })
  @ApiOkResponse({
    description: 'User registered successfully',
    schema: RegisterSuccessSwaggerSchema,
  })
  async register(@Body() body: unknown) {
    const dto = registerSchema.parse(body);

    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user credentials and returns an access token.',
  })
  @ApiBody({
    schema: LoginBodySwaggerSchema,
  })
  @ApiOkResponse({
    description: 'Login successful',
    schema: LoginSuccessSwaggerSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password',
  })
  async login(@Body() body: unknown) {
    const dto = loginSchema.parse(body);

    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get current authenticated user',
    description: 'Returns current authenticated user details from database.',
  })
  @ApiOkResponse({
    description: 'Current user returned successfully',
    schema: MeSuccessSwaggerSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid token',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.sub);
  }
}
