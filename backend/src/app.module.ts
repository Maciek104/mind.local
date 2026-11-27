import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { ConversationsModule } from './conversations/conversations.module.js';
import { MessagesModule } from './messages/messages.module.js';
import { SetupModule } from './setup/setup.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PlanModule } from './plan/plan.module.js';

@Module({
  imports: [UsersModule, DocumentsModule, ConversationsModule, MessagesModule, SetupModule, DatabaseModule, AuthModule, PlanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
