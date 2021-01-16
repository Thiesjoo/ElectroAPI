import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Logger } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

export const configValidation = Joi.object({
  API_PORT: Joi.number().default(3000),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(27017),
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
  public test() {
    return 'test';
  }
}
