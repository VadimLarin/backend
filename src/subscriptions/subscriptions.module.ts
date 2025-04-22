import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { Subscribe } from './entities/subscribe.entity';
import { SubsTypes } from './entities/subs-type.entity';
import { SubsStatus } from './entities/subs-status.entity';
import { Promocode } from './entities/promocode.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscribe, SubsTypes, SubsStatus, Promocode]),
    UsersModule,
  ],
  providers: [SubscriptionsService],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {}
