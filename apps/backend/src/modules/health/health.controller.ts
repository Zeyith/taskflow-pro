import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Public health check',
    description: 'Returns service health information and dependency status.',
  })
  @ApiOkResponse({
    description: 'Service health information returned successfully',
  })
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get('team-lead-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEAM_LEAD')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'RBAC test endpoint for Team Lead',
    description: 'Only Team Lead users can access this endpoint.',
  })
  @ApiOkResponse({
    description: 'Authorized Team Lead access',
  })
  getTeamLeadOnlyHealth() {
    return this.healthService.getTeamLeadOnlyHealth();
  }
}
