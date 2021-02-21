import * as cookieParser from 'cookie-parser';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import filters from './common/errors';
import interceptors from './common/interceptors';
import { ApiConfigService, corsSettings } from './config/configuration';
import { logLevels } from './models/enums/loglevels';
import { enumKeys } from './utils';

/** Log levels in order */
const levels = enumKeys(logLevels);

/**
 * Bootstrap the NestJS application
 */
async function bootstrap() {
  //Config
  const defaultLogLevel = process.env.LOG_LEVEL || 'verbose';
  const foundLogLevel = levels.findIndex((x) => x === defaultLogLevel);
  if (foundLogLevel === -1) {
    console.error(
      '[ERROR] Wrong log level provided, app cannot start like this!',
    );
    process.exit(1);
  }

  //Creation
  const app = await NestFactory.create(AppModule, {
    logger: levels.slice(0, foundLogLevel + 1).map((x) => <LogLevel>x),
  });

  const config = app.get(ApiConfigService);

  app.enableCors(corsSettings);

  //Global stuff
  app.useGlobalPipes(new ValidationPipe({}));
  app.useGlobalFilters(...filters);
  app.useGlobalInterceptors(...interceptors);

  //Express stuff
  app.use(cookieParser());

  //OpenAPI setup
  const swaggerBuilder = new DocumentBuilder()
    .setTitle('ElectroAPI')
    .setDescription('Currently WIP')
    .setVersion(config.version)
    .addTag('electro')
    .addBearerAuth({ in: 'header', type: 'http' })
    .addCookieAuth('jwt')
    .setBasePath('')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder, {
    // operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
}

bootstrap();
