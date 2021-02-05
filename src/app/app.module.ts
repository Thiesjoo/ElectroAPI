import * as mongooseUnique from 'mongoose-beautiful-unique-validation';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ConfigurationModule } from 'src/config/configuration.module';
import { userSchema } from 'src/models';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiConfigService } from '../config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IngestModule } from './ingest/ingest.module';
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
    MongooseModule.forFeature([userSchema]),
    AuthModule,
    UsersModule,
    IngestModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [MongooseModule],
})
export class AppModule {}
