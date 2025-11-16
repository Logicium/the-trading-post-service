import { Entity, PrimaryKey, Property, OneToMany, Collection, BeforeCreate, BeforeUpdate } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Post } from './post.entity';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class User {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  email: string;

  @Property({ hidden: true })
  password: string;

  @Property()
  name: string;

  @Property({ type: 'text', nullable: true })
  bio?: string;

  @Property({ type: 'json', nullable: true })
  skills: string[] = [];

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  timeBalance: number = 0;

  @Property()
  completedTrades: number = 0;

  @Property({ type: 'decimal', precision: 3, scale: 1 })
  rating: number = 5.0;

  @Property()
  joinDate: Date = new Date();

  @OneToMany(() => Post, post => post.user)
  posts = new Collection<Post>(this);

  @OneToMany(() => Message, message => message.sender)
  sentMessages = new Collection<Message>(this);

  @OneToMany(() => Transaction, transaction => transaction.provider)
  providedServices = new Collection<Transaction>(this);

  @OneToMany(() => Transaction, transaction => transaction.receiver)
  receivedServices = new Collection<Transaction>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
