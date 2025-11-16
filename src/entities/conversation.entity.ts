import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Message } from './message.entity';

@Entity()
export class Conversation {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => User)
  participant1: User;

  @ManyToOne(() => User)
  participant2: User;

  @Property({ type: 'text', nullable: true })
  lastMessage?: string;

  @Property({ nullable: true })
  lastMessageTime?: Date;

  @Property()
  unreadCountUser1: number = 0;

  @Property()
  unreadCountUser2: number = 0;

  @OneToMany(() => Message, message => message.conversation)
  messages = new Collection<Message>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
