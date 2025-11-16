import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';

export enum PostType {
  OFFER = 'offer',
  REQUEST = 'request',
}

@Entity()
export class Post {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user: User;

  @Property()
  title: string;

  @Property({ type: 'text' })
  description: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  hours: number;

  @Enum(() => PostType)
  type: PostType;

  @Property()
  category: string;

  @Property({ type: 'json' })
  tags: string[] = [];

  @Property()
  active: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
