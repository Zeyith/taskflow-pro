import {
  Controller,
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

    const notifications = await this.notificationsService.listMyNotifications(
      user,
      parsedQuery.limit,
      parsedQuery.offset,
    );

    return {
      items: notifications.map((item) => toNotificationResponse(item)),
      pagination: {
        limit: parsedQuery.limit,
        offset: parsedQuery.offset,
      },
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
}
