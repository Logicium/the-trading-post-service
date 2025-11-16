import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Post } from '../entities/post.entity';
import { Activity, ActivityType } from '../entities/activity.entity';

@Injectable()
export class MessageService {
  constructor(private readonly em: EntityManager) {}

  async createConversation(userId: string, postId: string) {
    const user = await this.em.findOne(User, { id: userId });
    const post = await this.em.findOne(Post, { id: postId }, { populate: ['user'] });

    if (!user || !post) {
      throw new NotFoundException('User or Post not found');
    }

    // Check if conversation already exists between these two users for this post
    const existing = await this.em.findOne(
      Conversation,
      {
        post: postId,
        $or: [
          { participant1: userId, participant2: post.user.id },
          { participant1: post.user.id, participant2: userId },
        ],
      },
      {
        populate: ['participant1', 'participant2', 'post', 'post.user'],
      },
    );

    if (existing) {
      return this.serializeConversation(existing, userId);
    }

    // Only prevent creating NEW conversation if user is the post author
    if (post.user.id === userId) {
      throw new ForbiddenException('You cannot create a conversation with your own post');
    }

    const conversation = new Conversation();
    conversation.post = post;
    conversation.participant1 = user;
    conversation.participant2 = post.user;

    await this.em.persistAndFlush(conversation);

    // Create activity
    const activity = new Activity();
    activity.type = ActivityType.CONNECTION_MADE;
    activity.user = user;
    activity.post = post;
    activity.targetUser = post.user;

    await this.em.persistAndFlush(activity);

    return this.serializeConversation(conversation, userId);
  }

  async getConversations(userId: string) {
    const conversations = await this.em.find(
      Conversation,
      {
        $or: [{ participant1: userId }, { participant2: userId }],
      },
      {
        populate: ['participant1', 'participant2', 'post'],
        orderBy: { lastMessageTime: 'DESC' },
      },
    );

    return conversations.map(conv => this.serializeConversation(conv, userId));
  }

  async getConversationById(conversationId: string, userId: string) {
    const conversation = await this.em.findOne(
      Conversation,
      { id: conversationId },
      { populate: ['participant1', 'participant2', 'post'] },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    return this.serializeConversation(conversation, userId);
  }

  async getMessages(conversationId: string, userId: string) {
    const conversation = await this.em.findOne(
      Conversation,
      { id: conversationId },
      { populate: ['participant1', 'participant2'] },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const messages = await this.em.find(
      Message,
      { conversation: conversationId },
      { populate: ['sender'], orderBy: { createdAt: 'ASC' } },
    );

    return messages.map(msg => this.serializeMessage(msg));
  }

  async sendMessage(conversationId: string, userId: string, text: string) {
    const conversation = await this.em.findOne(
      Conversation,
      { id: conversationId },
      { populate: ['participant1', 'participant2', 'post', 'post.user'] },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const message = new Message();
    message.conversation = conversation;
    message.sender = user;
    message.text = text;

    conversation.lastMessage = text.substring(0, 50) + (text.length > 50 ? '...' : '');
    conversation.lastMessageTime = new Date();

    // Update unread count for the other participant
    if (conversation.participant1.id === userId) {
      conversation.unreadCountUser2 += 1;
    } else {
      conversation.unreadCountUser1 += 1;
    }

    await this.em.persistAndFlush([message, conversation]);

    return this.serializeMessage(message);
  }

  async markAsRead(conversationId: string, userId: string) {
    const conversation = await this.em.findOne(
      Conversation,
      { id: conversationId },
      { populate: ['participant1', 'participant2'] },
    );

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1.id !== userId &&
      conversation.participant2.id !== userId
    ) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Reset unread count for this user
    if (conversation.participant1.id === userId) {
      conversation.unreadCountUser1 = 0;
    } else {
      conversation.unreadCountUser2 = 0;
    }

    // Mark all messages in this conversation as read
    const messages = await this.em.find(Message, { conversation: conversationId });
    messages.forEach(msg => (msg.read = true));

    await this.em.flush();

    return { message: 'Conversation marked as read' };
  }

  private serializeConversation(conversation: Conversation, userId?: string) {
    const otherParticipant =
      userId && conversation.participant1.id === userId
        ? conversation.participant2
        : conversation.participant1;

    const unreadCount =
      userId && conversation.participant1.id === userId
        ? conversation.unreadCountUser1
        : conversation.unreadCountUser2;

    return {
      id: conversation.id,
      postId: conversation.post.id,
      postTitle: conversation.post.title,
      postAuthor: conversation.post.user.name,
      participants: [conversation.participant1.name, conversation.participant2.name],
      otherParticipant: {
        id: otherParticipant.id,
        name: otherParticipant.name,
      },
      lastMessage: conversation.lastMessage || '',
      lastMessageTime: conversation.lastMessageTime?.toISOString() || conversation.createdAt.toISOString(),
      unreadCount: unreadCount || 0,
      createdAt: conversation.createdAt.toISOString(),
    };
  }

  private serializeMessage(message: Message) {
    return {
      id: message.id,
      conversationId: message.conversation.id,
      senderId: message.sender.id,
      senderName: message.sender.name,
      text: message.text,
      read: message.read,
      timestamp: message.createdAt.toISOString(),
      createdAt: message.createdAt.toISOString(),
    };
  }
}
