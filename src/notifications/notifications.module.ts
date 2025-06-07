import { Module } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { NotificationService } from './services/notification.service';
import { ConfigModule } from '@nestjs/config';
import { TestEmailController } from './controllers/test-email.controller';

@Module({
  imports: [ConfigModule],
  controllers: [TestEmailController],
  providers: [EmailService, NotificationService],
  exports: [EmailService, NotificationService],
})
export class NotificationsModule {}
