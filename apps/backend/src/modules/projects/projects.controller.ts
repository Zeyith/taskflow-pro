import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import {
  AddProjectMemberBodySwaggerSchema,
  CreateProjectBodySwaggerSchema,
  ProjectListResponseSwaggerSchema,
  ProjectMemberListResponseSwaggerSchema,
  ProjectMemberResponseSwaggerSchema,
  ProjectResponseSwaggerSchema,
  UpdateProjectBodySwaggerSchema,
  addProjectMemberSchema,
  createProjectSchema,
  projectIdParamSchema,
  projectListQuerySchema,
  projectMemberParamsSchema,
  updateProjectSchema,
} from './dto/projects.schema';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Create project',
    description: 'Creates a new project. Only Team Lead can create projects.',
  })
  @ApiBody({
    schema: CreateProjectBodySwaggerSchema,
  })
  @ApiOkResponse({
    description: 'Project created successfully',
    schema: ProjectResponseSwaggerSchema,
  })
  async createProject(
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const dto = createProjectSchema.parse(body);

    return this.projectsService.create({
      name: dto.name,
      description: dto.description ?? null,
      createdBy: user.sub,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'List projects',
    description: 'Returns project list with limit and offset pagination.',
  })
  @ApiOkResponse({
    description: 'Projects returned successfully',
    schema: ProjectListResponseSwaggerSchema,
  })
  async getProjects(
    @Query() query: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const dto = projectListQuerySchema.parse(query);

    return this.projectsService.findAll(dto.limit, dto.offset, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project detail',
    description: 'Returns a single project by id.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiOkResponse({
    description: 'Project returned successfully',
    schema: ProjectResponseSwaggerSchema,
  })
  async getProjectById(
    @Param() params: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { id } = projectIdParamSchema.parse(params);

    return this.projectsService.findById(id, {
      userId: user.sub,
      role: user.role,
    });
  }

  @Patch(':id')
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Update project',
    description:
      'Updates an active project. Only Team Lead can update projects.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiBody({
    schema: UpdateProjectBodySwaggerSchema,
  })
  @ApiOkResponse({
    description: 'Project updated successfully',
    schema: ProjectResponseSwaggerSchema,
  })
  async updateProject(@Param() params: unknown, @Body() body: unknown) {
    const { id } = projectIdParamSchema.parse(params);
    const dto = updateProjectSchema.parse(body);

    return this.projectsService.update({
      projectId: id,
      name: dto.name,
      description: dto.description,
    });
  }

  @Patch(':id/archive')
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Archive project',
    description:
      'Archives an existing project. Only Team Lead can archive projects.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiOkResponse({
    description: 'Project archived successfully',
    schema: ProjectResponseSwaggerSchema,
  })
  async archiveProject(@Param() params: unknown) {
    const { id } = projectIdParamSchema.parse(params);

    return this.projectsService.archive(id);
  }

  @Delete(':id')
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Delete project',
    description:
      'Soft deletes an archived project. Only Team Lead can delete projects.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiOkResponse({
    description: 'Project deleted successfully',
    schema: ProjectResponseSwaggerSchema,
  })
  async deleteProject(@Param() params: unknown) {
    const { id } = projectIdParamSchema.parse(params);

    return this.projectsService.softDelete(id);
  }

  @Post(':id/members')
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Add project member',
    description: 'Adds a user to a project. Only Team Lead can add members.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiBody({
    schema: AddProjectMemberBodySwaggerSchema,
  })
  @ApiOkResponse({
    description: 'Project member added successfully',
    schema: ProjectMemberResponseSwaggerSchema,
  })
  async addProjectMember(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { id } = projectIdParamSchema.parse(params);
    const dto = addProjectMemberSchema.parse(body);

    return this.projectsService.addMember({
      projectId: id,
      userId: dto.userId,
      addedBy: user.sub,
    });
  }

  @Delete(':id/members/:userId')
  @Roles('TEAM_LEAD')
  @ApiOperation({
    summary: 'Remove project member',
    description:
      'Removes a user from a project. Only Team Lead can remove members.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    example: '9d7f0a8a-5b24-4bd4-aeb3-d4c2e9911111',
  })
  @ApiOkResponse({
    description: 'Project member removed successfully',
    schema: ProjectMemberResponseSwaggerSchema,
  })
  async removeProjectMember(
    @Param() params: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { id, userId } = projectMemberParamsSchema.parse(params);

    return this.projectsService.removeMember({
      projectId: id,
      userId,
      removedBy: user.sub,
    });
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'List project members',
    description:
      'Returns active project members. Team Lead can always access. Employee can access only if they are an active member of the project.',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    example: '488bffe2-9a1a-48f9-98bd-b3339fa68a22',
  })
  @ApiOkResponse({
    description: 'Project members returned successfully',
    schema: ProjectMemberListResponseSwaggerSchema,
  })
  async getProjectMembers(
    @Param() params: unknown,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const { id } = projectIdParamSchema.parse(params);

    return this.projectsService.listMembers(id, {
      userId: user.sub,
      role: user.role,
    });
  }
}
