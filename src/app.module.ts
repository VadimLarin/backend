import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { getPostgresConfig } from './configs/postgres.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ForwardTextModule } from './forward-text/forward-text.module';
import { TermsModule } from './terms/terms.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (ConfigService: ConfigService) => ({
        type: 'postgres',
        host: ConfigService.get('DATABASE_HOST'),
        port: ConfigService.get('DATABASE_PORT'),
        username: ConfigService.get('DATABASE_USERNAME'),
        password: ConfigService.get('DATABASE_PASSWORD'),
        database: ConfigService.get('DATABASE_NAME'),
        synchronize: true,
        entities: [__dirname + '/**/*.entity{.js, .ts}'],
      }),
      inject: [ConfigService],
      // useFactory: getPostgresConfig,
    }),
    UsersModule,
    AuthModule,
    ForwardTextModule,
    TermsModule,
    SubscriptionsModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
