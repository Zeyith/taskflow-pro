import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JobTitlesService } from './job-titles.service';

@ApiTags('Job Titles')
@Controller('job-titles')
export class JobTitlesController {
  constructor(private readonly jobTitlesService: JobTitlesService) {}

  @Get()
  @ApiOperation({
    summary: 'List job titles',
    description: 'Returns available job titles for dropdown selections.',
  })
  @ApiOkResponse({
    description: 'Job titles returned successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '2b5e5b5d-1111-4444-9999-123456789abc',
          },
          code: {
            type: 'string',
            example: 'UI_UX_DESIGNER',
          },
          label: {
            type: 'string',
            example: 'UI/UX Designer',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-03-12T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-03-12T10:00:00.000Z',
          },
        },
      },
    },
  })
  async getJobTitles() {
    return this.jobTitlesService.findAll();
  }
}
