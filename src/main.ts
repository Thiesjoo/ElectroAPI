import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { enumKeys } from './common';
import filters from './common/errors';
import interceptors from './common/interceptors';
import { ApiConfigService, corsSettings } from './config/configuration';
import { IoAdapter } from './config/gateway.config';
import { logLevels } from './models/enums/loglevels';

/** Log levels in order */
const levels = enumKeys(logLevels);

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  //Config
  const defaultLogLevel = process.env.LOG_LEVEL || 'debug';
  const foundLogLevel = levels.findIndex((x) => x === defaultLogLevel);
  if (foundLogLevel === -1) {
    console.error(
      '[ERROR] Wrong log level provided, app cannot start like this!',
    );
    process.exit(1);
  }

  //Creation
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: levels.slice(0, foundLogLevel + 1).map((x) => <LogLevel>x),
  });

  const config = app.get(ApiConfigService);

  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors(corsSettings);

  //Global stuff
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(...filters);
  app.useGlobalInterceptors(...interceptors);

  //Express stuff
  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, 'public'));

  //OpenAPI setup
  const swaggerBuilder = new DocumentBuilder()
    .setTitle('ElectroAPI')
    .setDescription('Currently WIP')
    .setVersion(config.version)
    .addTag('electro')
    .addBearerAuth({ in: 'header', type: 'http' })
    .addCookieAuth('jwt')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  SwaggerModule.setup('api', app, document);

  app.listen(config.port);
}

bootstrap();
