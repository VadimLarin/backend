import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { FeedbackController } from './feedback.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [MailService],
  controllers: [FeedbackController],
  exports: [MailService],
})
export class MailModule {}
