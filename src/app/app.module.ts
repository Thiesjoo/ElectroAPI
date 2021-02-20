import * as mongooseUnique from 'mongoose-beautiful-unique-validation';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ConfigurationModule } from 'src/config/configuration.module';
import { notificationSchema, userSchema } from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiConfigService } from '../config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { IngestModule } from './ingest/ingest.module';
import { NotificationModule } from './notifications/notifications.module';
import { UsersModule } from './users/users.module';

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
            connection.plugin(mongoosePaginate);
            connection.plugin(mongooseUnique);
            return connection;
          },
        };
      },
      inject: [ApiConfigService],
    }),
    MongooseModule.forFeature([userSchema, notificationSchema]),
    AuthModule,
    UsersModule,
    NotificationModule,
    IngestModule,
  ],
  controllers: [AppController],
  exports: [MongooseModule],
})
export class AppModule {}
