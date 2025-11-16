import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Activity } from '../entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(private readonly em: EntityManager) {}

  async getRecentActivities(limit: number = 20) {
    const activities = await this.em.find(
      Activity,
      {},
      {
        populate: ['user', 'post', 'targetUser'],
        orderBy: { createdAt: 'DESC' },
        limit,
      },
    );

    return activities.map(activity => this.serializeActivity(activity));
  }

  private serializeActivity(activity: Activity) {
    return {
      id: activity.id,
      type: activity.type,
      userId: activity.user.id,
      userName: activity.user.name,
      postId: activity.post?.id,
      postTitle: activity.post?.title,
      targetUser: activity.targetUser?.name,
      timestamp: activity.createdAt.toISOString(),
    };
  }
}
