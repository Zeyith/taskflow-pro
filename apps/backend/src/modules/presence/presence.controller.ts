import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { PresenceService } from './presence.service';

@Controller('projects/:projectId/presence')
@UseGuards(JwtAuthGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get()
  async getProjectPresence(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.presenceService.getProjectPresence(projectId, currentUser);
  }
}
