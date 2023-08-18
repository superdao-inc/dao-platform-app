import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserNotification } from './userNotification.model';
import { UserNotificationService } from 'src/entities/userNotification/user-notification.service';
import { UserNotificationResolver } from 'src/entities/userNotification/userNotification.resolver';

@Module({
	imports: [TypeOrmModule.forFeature([UserNotification])],
	providers: [UserNotificationService, UserNotificationResolver]
})
export class UserNotificationModule {}
