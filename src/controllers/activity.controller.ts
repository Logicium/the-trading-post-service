import { Controller, Get, Query } from '@nestjs/common';
import { ActivityService } from '../services/activity.service';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getRecentActivities(@Query('limit') limit?: number) {
    return this.activityService.getRecentActivities(limit ? parseInt(limit.toString()) : 20);
  }
}
