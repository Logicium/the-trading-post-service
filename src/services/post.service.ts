import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Post, PostType } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Activity, ActivityType } from '../entities/activity.entity';

@Injectable()
export class PostService {
  constructor(private readonly em: EntityManager) {}

  async createPost(
    userId: string,
    data: {
      title: string;
      description: string;
      hours: number;
      type: PostType;
      category: string;
      tags: string[];
    },
  ) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = new Post();
    post.user = user;
    post.title = data.title;
    post.description = data.description;
    post.hours = data.hours;
    post.type = data.type;
    post.category = data.category;
    post.tags = data.tags;

    await this.em.persistAndFlush(post);

    // Create activity
    const activity = new Activity();
    activity.type = ActivityType.POST_CREATED;
    activity.user = user;
    activity.post = post;

    await this.em.persistAndFlush(activity);

    return this.serializePost(post);
  }

  async getAllPosts(type?: PostType) {
    const where: any = { active: true };
    if (type) {
      where.type = type;
    }

    const posts = await this.em.find(
      Post,
      where,
      { populate: ['user'], orderBy: { createdAt: 'DESC' } },
    );

    return posts.map(post => this.serializePost(post));
  }

  async getPostById(postId: string) {
    const post = await this.em.findOne(Post, { id: postId }, { populate: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.serializePost(post);
  }

  async updatePost(
    postId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      hours?: number;
      category?: string;
      tags?: string[];
      active?: boolean;
    },
  ) {
    const post = await this.em.findOne(Post, { id: postId }, { populate: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    if (updates.title) post.title = updates.title;
    if (updates.description) post.description = updates.description;
    if (updates.hours) post.hours = updates.hours;
    if (updates.category) post.category = updates.category;
    if (updates.tags) post.tags = updates.tags;
    if (updates.active !== undefined) post.active = updates.active;

    await this.em.flush();

    return this.serializePost(post);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.em.findOne(Post, { id: postId }, { populate: ['user'] });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    post.active = false;
    await this.em.flush();

    return { message: 'Post deleted successfully' };
  }

  async getUserPosts(userId: string) {
    const posts = await this.em.find(
      Post,
      { user: userId },
      { populate: ['user'], orderBy: { createdAt: 'DESC' } },
    );
    return posts.map(post => this.serializePost(post));
  }

  private serializePost(post: Post) {
    return {
      id: post.id,
      author: post.user.name,
      authorId: post.user.id,
      title: post.title,
      description: post.description,
      hours: post.hours,
      type: post.type,
      category: post.category,
      tags: post.tags,
      active: post.active,
      date: post.createdAt.toISOString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  }
}
