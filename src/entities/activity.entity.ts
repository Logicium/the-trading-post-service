import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';
import { Post } from './post.entity';

export enum ActivityType {
  POST_CREATED = 'post_created',
  CONNECTION_MADE = 'connection_made',
}

@Entity()
export class Activity {
  @PrimaryKey()
  id: string = uuid();

  @Enum(() => ActivityType)
  type: ActivityType;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Post, { nullable: true })
  post?: Post;

  @ManyToOne(() => User, { nullable: true })
  targetUser?: User;

  @Property()
  createdAt: Date = new Date();
}
