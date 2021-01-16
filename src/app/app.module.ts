import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigService, configValidation } from '../config/configuration';
import { UsersModule } from './users/users.module';
import { userSchema } from 'src/models';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: configValidation,
      validationOptions: {
        abortEarly: true,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: `mongodb://${configService.get(
            'DATABASE_HOST',
          )}:${configService.get('DATABASE_PORT')}/${configService.get(
            'NODE_ENV',
          )}`,
          useCreateIndex: true,
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([userSchema]),
  ],
  controllers: [AppController],
  providers: [AppService, ApiConfigService],
  exports: [MongooseModule],
})
export class AppModule {}
