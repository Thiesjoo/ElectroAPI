import * as mongooseUnique from 'mongoose-beautiful-unique-validation';
import { mongoosePagination } from 'mongoose-paginate-ts';
import * as Pusher from 'pusher';
import { InjectionTokens } from 'src/common/injection.tokens';
import { ConfigurationModule } from 'src/config/configuration.module';
import { notificationSchema, userSchema, webhookSchema } from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiConfigService } from '../config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LiveService } from './live/live.service';
import { NotificationModule } from './notifications/notifications.module';
import { NotificationService } from './notifications/notifications.service';
import { UsersModule } from './users/users.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { WebhooksService } from './webhooks/webhooks.service';

@Module({
  imports: [
    ConfigurationModule,
    MongooseModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: async (configService: ApiConfigService) => {
        return {
          uri: configService.mongoURL,
          useCreateIndex: true,
          connectionFactory: (connection) => {
            connection.plugin(mongoosePagination);
            connection.plugin(mongooseUnique);
            return connection;
          },
        };
      },
      inject: [ApiConfigService],
    }),
    MongooseModule.forFeature([userSchema, notificationSchema, webhookSchema]),
    AuthModule,
    UsersModule,
    NotificationModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: InjectionTokens.Pusher,
      useFactory: (configService: ApiConfigService) => {
        return new Pusher({
          ...configService.pusherConfig,
          cluster: 'eu',
          useTLS: true,
        });
      },
      inject: [ApiConfigService],
    },
    LiveService,
    NotificationService,
    WebhooksService,
  ],
  controllers: [AppController],
  exports: [
    MongooseModule,
    InjectionTokens.Pusher,
    LiveService,
    NotificationService,
  ],
})
export class AppModule {}
