import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Transaction, TransactionStatus } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class TransactionService {
  constructor(private readonly em: EntityManager) {}

  async createTransaction(
    userId: string,
    postId: string,
    providerId: string,
    receiverId: string,
    hours: number,
  ) {
    const post = await this.em.findOne(Post, { id: postId });
    const provider = await this.em.findOne(User, { id: providerId });
    const receiver = await this.em.findOne(User, { id: receiverId });

    if (!post || !provider || !receiver) {
      throw new NotFoundException('Post or users not found');
    }

    const transaction = new Transaction();
    transaction.post = post;
    transaction.provider = provider;
    transaction.receiver = receiver;
    transaction.hours = hours;
    transaction.status = TransactionStatus.PENDING_PROVIDER;

    await this.em.persistAndFlush(transaction);

    return this.serializeTransaction(transaction);
  }

  async getUserTransactions(userId: string) {
    const transactions = await this.em.find(
      Transaction,
      {
        $or: [{ provider: userId }, { receiver: userId }],
      },
      {
        populate: ['post', 'provider', 'receiver'],
        orderBy: { createdAt: 'DESC' },
      },
    );

    return transactions.map(t => this.serializeTransaction(t));
  }

  async getOrCreateTransactionForPost(userId: string, postId: string) {
    const post = await this.em.findOne(Post, { id: postId }, { populate: ['user'] });
    
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if transaction already exists for this post
    const existing = await this.em.findOne(
      Transaction,
      { post: postId },
      { populate: ['post', 'provider', 'receiver'] },
    );

    if (existing) {
      return this.serializeTransaction(existing);
    }

    // Determine provider and receiver based on post type
    let providerId: string;
    let receiverId: string;

    if (post.type === 'offer') {
      // Post author is offering a service, so they are the provider
      providerId = post.user.id;
      receiverId = userId; // The person who connected
    } else {
      // Post author is requesting help, so the person who connected is the provider
      providerId = userId;
      receiverId = post.user.id;
    }

    // Create new transaction
    return this.createTransaction(userId, postId, providerId, receiverId, post.hours);
  }

  async confirmTransaction(transactionId: string, userId: string) {
    const transaction = await this.em.findOne(
      Transaction,
      { id: transactionId },
      { populate: ['post', 'provider', 'receiver'] },
    );

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      transaction.provider.id !== userId &&
      transaction.receiver.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this transaction');
    }

    // Check if already completed
    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Transaction already completed');
    }

    // Mark confirmation based on who confirmed
    if (transaction.provider.id === userId) {
      if (transaction.providerConfirmed) {
        throw new BadRequestException('You have already confirmed this transaction');
      }
      transaction.providerConfirmed = true;
    } else {
      if (transaction.receiverConfirmed) {
        throw new BadRequestException('You have already confirmed this transaction');
      }
      transaction.receiverConfirmed = true;
    }

    // If both parties confirmed, complete the transaction
    if (transaction.providerConfirmed && transaction.receiverConfirmed) {
      transaction.status = TransactionStatus.COMPLETED;
      transaction.completedAt = new Date();

      // Update time balances
      transaction.provider.timeBalance = Number(transaction.provider.timeBalance) + Number(transaction.hours);
      transaction.receiver.timeBalance = Number(transaction.receiver.timeBalance) - Number(transaction.hours);

      // Update completed trades count
      transaction.provider.completedTrades += 1;
      transaction.receiver.completedTrades += 1;
    } else {
      // Update status to show who's pending
      if (transaction.providerConfirmed && !transaction.receiverConfirmed) {
        transaction.status = TransactionStatus.PENDING_RECEIVER;
      } else if (!transaction.providerConfirmed && transaction.receiverConfirmed) {
        transaction.status = TransactionStatus.PENDING_PROVIDER;
      }
    }

    await this.em.flush();

    return this.serializeTransaction(transaction);
  }

  async getTransactionById(transactionId: string, userId: string) {
    const transaction = await this.em.findOne(
      Transaction,
      { id: transactionId },
      { populate: ['post', 'provider', 'receiver'] },
    );

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      transaction.provider.id !== userId &&
      transaction.receiver.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this transaction');
    }

    return this.serializeTransaction(transaction);
  }

  private serializeTransaction(transaction: Transaction) {
    return {
      id: transaction.id,
      postId: transaction.post.id,
      postTitle: transaction.post.title,
      provider: {
        id: transaction.provider.id,
        name: transaction.provider.name,
      },
      receiver: {
        id: transaction.receiver.id,
        name: transaction.receiver.name,
      },
      hours: transaction.hours,
      status: transaction.status,
      providerConfirmed: transaction.providerConfirmed,
      receiverConfirmed: transaction.receiverConfirmed,
      completedAt: transaction.completedAt?.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
