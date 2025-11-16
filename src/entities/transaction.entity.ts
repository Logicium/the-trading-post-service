import { Entity, PrimaryKey, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';
import { User } from './user.entity';
import { Post } from './post.entity';

export enum TransactionStatus {
  PENDING_PROVIDER = 'pending_provider',
  PENDING_RECEIVER = 'pending_receiver',
  COMPLETED = 'completed',
}

@Entity()
export class Transaction {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Post)
  post: Post;

  @ManyToOne(() => User)
  provider: User; // Person providing the service

  @ManyToOne(() => User)
  receiver: User; // Person receiving the service

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  hours: number;

  @Enum(() => TransactionStatus)
  status: TransactionStatus = TransactionStatus.PENDING_PROVIDER;

  @Property()
  providerConfirmed: boolean = false;

  @Property()
  receiverConfirmed: boolean = false;

  @Property({ nullable: true })
  completedAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
