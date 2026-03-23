import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  accessibleIncidentListQuerySchema,
  createIncidentSchema,
  incidentIdParamSchema,
  projectIncidentListParamSchema,
} from './dto/incidents-validation.schema';
import { IncidentsService } from './incidents.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post('incidents')
  async createIncident(
    @Body() body: unknown,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const parsedBody = createIncidentSchema.parse(body);

    return this.incidentsService.createIncident(parsedBody, currentUser);
  }

  @Get('incidents')
  async listAccessibleIncidents(
    @Query() query: unknown,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const parsedQuery = accessibleIncidentListQuerySchema.parse(query);

    return this.incidentsService.listAccessibleIncidents(
      parsedQuery,
      currentUser,
    );
  }

  @Get('projects/:projectId/incidents')
  async listProjectIncidents(
    @Param() params: unknown,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const parsedParams = projectIncidentListParamSchema.parse(params);

    return this.incidentsService.listProjectIncidents(
      parsedParams.projectId,
      currentUser,
    );
  }

  @Get('incidents/:id')
  async getIncidentById(
    @Param() params: unknown,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const parsedParams = incidentIdParamSchema.parse(params);

    return this.incidentsService.getIncidentById(parsedParams.id, currentUser);
  }

  @Patch('incidents/:id/close')
  async closeIncident(
    @Param() params: unknown,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    const parsedParams = incidentIdParamSchema.parse(params);

    return this.incidentsService.closeIncident(parsedParams.id, currentUser);
  }
}