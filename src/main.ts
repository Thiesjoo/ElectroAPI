import * as cookieParser from 'cookie-parser';
import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import filters from './app/errors';
import { ApiConfigService } from './config/configuration';
import { logLevels } from './models/enums/loglevels';
import { enumKeys } from './utils';

const levels = enumKeys(logLevels);

async function bootstrap() {
  const defaultLogLevel = process.env.LOG_LEVEL || 'verbose';
  const foundLogLevel = levels.findIndex((x) => x === defaultLogLevel);
  if (foundLogLevel === -1) {
    console.error(
      '[ERROR] Wrong log level provided, app cannot start like this!',
    );
    process.exit(1);
  }
  const app = await NestFactory.create(AppModule, {
    logger: levels.slice(0, foundLogLevel + 1).map((x) => <LogLevel>x),
  });
  app.useGlobalPipes(new ValidationPipe({}));
  app.useGlobalFilters(...filters);
  app.use(cookieParser());

  const config = app.get(ApiConfigService);

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

  await app.listen(config.port);
}
bootstrap();
