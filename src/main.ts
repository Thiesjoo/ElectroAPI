import { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ApiConfigService } from './config/configuration';
import { logLevels } from './models/enums/loglevels';
import { enumKeys } from './utils';
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
  const config = app.get(ApiConfigService);

  const swaggerBuilder = new DocumentBuilder()
    .setTitle('ElectroAPI')
    .setDescription('Currently WIP')
    .setVersion(config.version)
    .addTag('electro')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerBuilder);
  SwaggerModule.setup('api', app, document);

  await app.listen(config.port);
}
bootstrap();
