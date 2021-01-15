import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigService, configValidation } from './config/configuration';
import { NotificationService, NotificationController } from './notification/';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: configValidation,
      validationOptions: {
        abortEarly: true,
      },
    }),
    UsersModule,
  ],
  controllers: [AppController, NotificationController],
  providers: [AppService, ApiConfigService, NotificationService],
})
export class AppModule {}
