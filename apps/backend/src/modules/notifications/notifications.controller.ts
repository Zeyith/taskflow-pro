import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  notificationIdParamSchema,
  notificationListQuerySchema,
} from './dto/notification-validation.schema';
import { toNotificationResponse } from './notification-response.mapper';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List my notifications',
    description: 'Returns notifications for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Notification list returned successfully',
  })
  async listMyNotifications(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: unknown,
  ) {
    const parsedQuery = notificationListQuerySchema.parse(query);

    const result = await this.notificationsService.listMyNotifications(
      user,
      parsedQuery.limit,
      parsedQuery.offset,
    );

    return {
      items: result.items.map((item) => toNotificationResponse(item)),
      pagination: result.pagination,
    };
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description:
      'Returns unread notification count for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Unread count returned successfully',
  })
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getMyUnreadCount(user);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications as read for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'All notifications marked as read successfully',
  })
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a notification as read for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Notification marked as read successfully',
  })
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: unknown,
  ) {
    const parsedParams = notificationIdParamSchema.parse(params);

    const notification = await this.notificationsService.markAsRead(
      user,
      parsedParams.id,
    );

    return toNotificationResponse(notification);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Soft deletes a notification for the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Notification deleted successfully',
  })
  async deleteNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Param() params: unknown,
  ) {
    const parsedParams = notificationIdParamSchema.parse(params);

    const notification = await this.notificationsService.deleteNotification(
      user,
      parsedParams.id,
    );

    return toNotificationResponse(notification);
  }
}
