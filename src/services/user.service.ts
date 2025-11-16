import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async getProfile(userId: string) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(
    userId: string,
    updates: {
      name?: string;
      bio?: string;
      skills?: string[];
    },
  ) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updates.name) user.name = updates.name;
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.skills) user.skills = updates.skills;

    await this.em.flush();

    return this.sanitizeUser(user);
  }

  async getUserById(userId: string) {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sanitizeUser(user);
  }

  async getAllUsers() {
    const users = await this.em.find(User, {});
    return users.map(user => this.sanitizeUser(user));
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user as any;
    return result;
  }
}
