import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ApiConfigService } from './config/configuration';
import { logLevels } from './models/enums/loglevels';
import { enumKeys } from './utils';
import { ValidationFilter } from './app/errors';
const levels = enumKeys(logLevels);

async function bootstrap() {
  const defaultLogLevel = process.env.LOG_LEVEL;
  if (!levels.includes(defaultLogLevel)) {
    console.error(
      'LOG_LEVEL is not present in ENV or loglevel is not a valid level. App cannot start',
    );
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: levels
      .slice(0, levels.findIndex((x) => x === defaultLogLevel) + 1)
      .map((x) => <LogLevel>x),
  });
  app.useGlobalPipes(new ValidationPipe({}));
  app.useGlobalFilters(new ValidationFilter());

  const config = app.get(ApiConfigService);

  const swaggerBuilder = new DocumentBuilder()
    .setTitle('ElectroAPI')
    .setDescription('Currently WIP')
    .setVersion(config.version)
    .addTag('electro')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
}
bootstrap();
