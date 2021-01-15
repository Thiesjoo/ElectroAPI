import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigService, configValidation } from './config/configuration';

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
  ],
  controllers: [AppController],
  providers: [AppService, ApiConfigService],
})
export class AppModule {}
