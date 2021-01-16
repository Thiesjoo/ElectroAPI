import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';

export const configValidation = Joi.object({
  API_PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(27017),
  JWT_PATH: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  LOG_LEVEL: Joi.string().default('silly'),
  npm_package_version: Joi.string(),
});

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}
  get(val) {
    return this.configService.get(val);
  }

  get production(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  get mongoURL(): string {
    return `mongodb://${this.get('DATABASE_HOST')}:${this.get(
      'DATABASE_PORT',
    )}/${this.get('NODE_ENV')}`;
  }

  get port(): number {
    return this.get('API_PORT');
  }

  get version(): string {
    return this.get('npm_package_version');
  }

  private jwt(pub: boolean): string {
    let jwtPath = this.get('JWT_PATH');
    jwtPath = path.join(jwtPath, `jwt.key${pub ? '.pub' : ''}`);

    if (!path.isAbsolute(jwtPath)) {
      jwtPath = path.join(require.main.path, jwtPath);
    }
    return jwtPath;
  }

  get jwtPublic(): string {
    return this.jwt(true);
  }
  get jwtPrivate(): string {
    return this.jwt(false);
  }
}
