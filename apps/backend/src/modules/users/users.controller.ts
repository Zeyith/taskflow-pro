import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  changeOwnPasswordBodySchema,
  resetUserPasswordBodySchema,
  updateUserProfileBodySchema,
  updateUserRoleBodySchema,
  updateUserStatusBodySchema,
  userIdParamSchema,
} from './dto/user-validation.schema';
import {
  toUserResponse,
  type UserResponseDto,
} from './mappers/user-response.mapper';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async updateProfile(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const { id } = userIdParamSchema.parse(params);
    const parsedBody = updateUserProfileBodySchema.parse(body);

    const updatedUser = await this.usersService.updateProfile(
      id,
      actor,
      parsedBody,
    );

    return toUserResponse(updatedUser);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async changeOwnPassword(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const { id } = userIdParamSchema.parse(params);
    const parsedBody = changeOwnPasswordBodySchema.parse(body);

    const updatedUser = await this.usersService.changeOwnPassword(
      id,
      actor,
      parsedBody,
    );

    return toUserResponse(updatedUser);
  }

  @Get()
  @ApiOperation({ summary: 'List active users for selection' })
  async getUsers(
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll(actor);

    return users.map((user) => toUserResponse(user));
  }

  @Patch(':id/password/reset')
  @ApiOperation({ summary: 'Reset user password as team lead' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async resetPassword(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const { id } = userIdParamSchema.parse(params);
    const parsedBody = resetUserPasswordBodySchema.parse(body);

    const updatedUser = await this.usersService.resetPassword(
      id,
      actor,
      parsedBody.newPassword,
    );

    return toUserResponse(updatedUser);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async updateRole(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const { id } = userIdParamSchema.parse(params);
    const parsedBody = updateUserRoleBodySchema.parse(body);

    const updatedUser = await this.usersService.updateRole(
      id,
      actor,
      parsedBody,
    );

    return toUserResponse(updatedUser);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user active status' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async updateStatus(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    const { id } = userIdParamSchema.parse(params);
    const parsedBody = updateUserStatusBodySchema.parse(body);

    const updatedUser = await this.usersService.updateStatus(
      id,
      actor,
      parsedBody,
    );

    return toUserResponse(updatedUser);
  }
}
