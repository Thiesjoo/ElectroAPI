import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import * as path from 'path';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { AuthProviders } from 'src/models';

const OauthJoiScheme = Joi.object({
  clientID: Joi.string().required(),
  clientSecret: Joi.string().required(),
  callbackURL: Joi.string().required(),
});

const configValidation = Joi.object({
  mongodb: Joi.object({
    host: Joi.string().required(),
    port: Joi.number().default(27017),
  }).default(),
  providers: Joi.object({
    discord: OauthJoiScheme,
  }),
  app: Joi.object({
    jwtPath: Joi.string().required(),
    logLevel: Joi.string().required(),
    port: Joi.number().default(3000),
  }),
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  npm_package_version: Joi.string(),
}).default();

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
    const db = this.configService.get('mongodb');
    return `mongodb://${db.host}:${db.port}/${this.get('NODE_ENV')}`;
  }

  get port(): number {
    return this.get('app.port');
  }

  get version(): string {
    return this.get('npm_package_version');
  }

  private jwt(pub: boolean): string {
    let jwtPath = this.get('app.jwtPath');
    jwtPath = path.join(jwtPath, `jwt.key${pub ? '.pub' : ''}`);

    if (!path.isAbsolute(jwtPath)) {
      jwtPath = path.join(require.main.path, jwtPath);
    }
    return jwtPath;
  }

  get jwtPublicPath(): string {
    return this.jwt(true);
  }
  get jwtPrivatePath(): string {
    return this.jwt(false);
  }

  provider(
    providerType: AuthProviders,
  ): {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  } {
    return this.get(`providers.${providerType}`);
  }
}

export function loadConfig() {
  let yamlLoaded = yaml.load(
    readFileSync(path.join(require.main.path, '../env.yml'), 'utf8'),
  ) as object;
  const allConfigs = { ...yamlLoaded, ...process.env };

  const { value, error } = configValidation.validate(allConfigs, {
    allowUnknown: true,
    abortEarly: true,
  });
  if (error) {
    throw error;
  }
  return value;
}
