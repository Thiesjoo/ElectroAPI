import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const envPropsArr = ['NODE_ENV', 'API_PORT', 'LOG_LEVEL'];

async function bootstrap() {
  const env = Object.keys(process.env);
  envPropsArr.forEach((x) => {
    if (env.indexOf(x) === -1) {
      throw new Error(`Property ${x} is not present in the .env file`);
    }
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.API_PORT);
}
bootstrap();
