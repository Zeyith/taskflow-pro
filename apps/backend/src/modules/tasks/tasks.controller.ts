import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  AddTaskAssigneeBodySwaggerSchema,
  CreateTaskBodySwaggerSchema,
  UpdateTaskAssignmentStatusBodySwaggerSchema,
  UpdateTaskBodySwaggerSchema,
  addTaskAssigneeBodySchema,
  createTaskBodySchema,
  projectIdParamSchema,
  taskAssigneeParamsSchema,
  taskIdParamSchema,
  updateTaskAssignmentStatusBodySchema,
  updateTaskBodySchema,
} from './dto/task-validation.schema';
import {
  toTaskDetailResponse,
  toTaskListItemResponse,
  type TaskDetailResponseDto,
  type TaskListItemResponseDto,
} from './mappers/task-response.mapper';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  @ApiOperation({ summary: 'Create task' })
  @ApiBody({
    schema: CreateTaskBodySwaggerSchema,
  })
  async createTask(
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const parsedBody = createTaskBodySchema.parse(body);
    const detail = await this.tasksService.createTask(actor, parsedBody);

    return toTaskDetailResponse(detail);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task detail' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async getTaskDetail(
    @Param() params: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const { id } = taskIdParamSchema.parse(params);
    const detail = await this.tasksService.getTaskDetail(actor, id);

    return toTaskDetailResponse(detail);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'List tasks for project' })
  @ApiParam({
    name: 'projectId',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async listProjectTasks(
    @Param() params: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<{
    data: TaskListItemResponseDto[];
    meta: {
      isCached: boolean;
    };
  }> {
    const { projectId } = projectIdParamSchema.parse(params);
    const result = await this.tasksService.listProjectTasks(actor, projectId);

    return {
      data: result.data.map(toTaskListItemResponse),
      meta: result.meta,
    };
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiBody({
    schema: UpdateTaskBodySwaggerSchema,
  })
  async updateTask(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const { id } = taskIdParamSchema.parse(params);
    const parsedBody = updateTaskBodySchema.parse(body);
    const detail = await this.tasksService.updateTask(actor, id, parsedBody);

    return toTaskDetailResponse(detail);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  async deleteTask(
    @Param() params: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<{ success: true }> {
    const { id } = taskIdParamSchema.parse(params);

    await this.tasksService.deleteTask(actor, id);

    return { success: true };
  }

  @Post('tasks/:id/assignees')
  @ApiOperation({ summary: 'Add task assignee' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiBody({
    schema: AddTaskAssigneeBodySwaggerSchema,
  })
  async addAssignee(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const { id } = taskIdParamSchema.parse(params);
    const parsedBody = addTaskAssigneeBodySchema.parse(body);

    const detail = await this.tasksService.addAssignee(
      actor,
      id,
      parsedBody.userId,
    );

    return toTaskDetailResponse(detail);
  }

  @Delete('tasks/:id/assignees/:userId')
  @ApiOperation({ summary: 'Remove task assignee' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    format: 'uuid',
    example: '22222222-2222-2222-2222-222222222222',
  })
  async removeAssignee(
    @Param() params: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const { id, userId } = taskAssigneeParamsSchema.parse(params);
    const detail = await this.tasksService.removeAssignee(actor, id, userId);

    return toTaskDetailResponse(detail);
  }

  @Patch('tasks/:id/assignees/:userId/status')
  @ApiOperation({ summary: 'Update task assignee status' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    example: '11111111-1111-1111-1111-111111111111',
  })
  @ApiParam({
    name: 'userId',
    type: String,
    format: 'uuid',
    example: '22222222-2222-2222-2222-222222222222',
  })
  @ApiBody({
    schema: UpdateTaskAssignmentStatusBodySwaggerSchema,
  })
  async updateAssignmentStatus(
    @Param() params: unknown,
    @Body() body: unknown,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<TaskDetailResponseDto> {
    const { id, userId } = taskAssigneeParamsSchema.parse(params);
    const parsedBody = updateTaskAssignmentStatusBodySchema.parse(body);

    const detail = await this.tasksService.updateAssignmentStatus(
      actor,
      id,
      userId,
      parsedBody.status,
    );

    return toTaskDetailResponse(detail);
  }
}
