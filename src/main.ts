import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'joi';
import { AppModule } from './app/app.module';
import { ApiConfigService } from './config/configuration';
import { logLevels } from './models/enums/loglevels';
import { enumKeys, ValidationFilter } from './utils';
const levels = enumKeys(logLevels);

async function bootstrap() {
  const defaultLogLevel = process.env.LOG_LEVEL;
  if (!levels.includes(defaultLogLevel)) {
    console.error('Log level is not present in ENV. App cannot start');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, {
    logger: levels
      .slice(0, levels.findIndex((x) => x === defaultLogLevel) + 1)
      .map((x) => <LogLevel>x),
  });
  app.useGlobalFilters(new ValidationFilter());
  app.useGlobalPipes(new ValidationPipe({}));

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
