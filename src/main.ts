import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiConfigService } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
