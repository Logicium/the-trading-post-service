import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

@Entity()
export class Message {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @ManyToOne(() => User)
  sender: User;

  @Property({ type: 'text' })
  text: string;

  @Property()
  read: boolean = false;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
