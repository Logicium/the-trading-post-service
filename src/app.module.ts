import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { JwtModule } from '@nestjs/jwt';

// Entities
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Activity } from './entities/activity.entity';
import { Transaction } from './entities/transaction.entity';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { UserController } from './controllers/user.controller';
import { PostController } from './controllers/post.controller';
import { MessageController } from './controllers/message.controller';
import { ActivityController } from './controllers/activity.controller';
import { TransactionController } from './controllers/transaction.controller';

// Services
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { PostService } from './services/post.service';
import { MessageService } from './services/message.service';
import { ActivityService } from './services/activity.service';
import { TransactionService } from './services/transaction.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature([
      User,
      Post,
      Conversation,
      Message,
      Activity,
      Transaction,
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    PostController,
    MessageController,
    ActivityController,
    TransactionController,
  ],
  providers: [
    AppService,
    AuthService,
    UserService,
    PostService,
    MessageService,
    ActivityService,
    TransactionService,
    AuthGuard,
  ],
})
export class AppModule {}
