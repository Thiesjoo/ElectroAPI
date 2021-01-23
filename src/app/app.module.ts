import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigService } from '../config/configuration';
import { UsersModule } from './users/users.module';
import { userSchema } from 'src/models';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from 'src/config/configuration.module';
import * as mongoosePaginate from 'mongoose-paginate-v2';
import * as mongooseUnique from 'mongoose-beautiful-unique-validation';

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
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [MongooseModule],
})
export class AppModule {}
