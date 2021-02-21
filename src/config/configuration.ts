import { existsSync, readFileSync } from 'fs';
import * as Joi from 'joi';
import * as yaml from 'js-yaml';
import * as ms from 'ms';
import { isAbsolute as pathAbsolute, join as pathJoin } from 'path';
import { AuthProviders } from 'src/models';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** All cookie settings */
interface CookieSettings {
  /** Same site Settings. Should be strict on production */
  sameSite: 'none' | 'strict' | false;
  /** Expiry date in unix time */
  expires: Date;
  /** Wether the cookie should be accessible by JS */
  httpOnly: boolean;
  /** Wether the cookie should only be served with https */
  secure: boolean;
  /** The path the cookie applies to */
  path: string;
}

/** Nested validation */
const OauthJoiScheme = Joi.object({
  clientID: Joi.string().required(),
  clientSecret: Joi.string().required(),
  callbackURL: Joi.string().required(),
});

/** Validation for .yml file */
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
}).default();

/** Configuration service for entire API */
@Injectable()
export class ApiConfigService {
  /** Constructor */
  constructor(private configService: ConfigService) {}

  /** Get value with string */
  get(val: string): any {
    return this.configService.get(val);
  }

  /** Boolean if app is in production */
  get production(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  /** MongoDatabase url. */
  get mongoURL(): string {
    const db = this.configService.get('mongodb');
    return `mongodb://${db.host}:${db.port}/${this.get('NODE_ENV')}`;
  }

  /** Port application should run on */
  get port(): number {
    return this.get('app.port');
  }

  /** Actual version of the application */
  get version(): string {
    const info = JSON.parse(
      readFileSync(pathJoin(require.main.path, '../package.json'), 'utf-8'),
    );
    return info?.version || '0.0.0';
  }

  /** Get JWT key from file system */
  private getJWT(pub: boolean): string {
    let jwtPath = this.get('app.jwtPath');
    jwtPath = pathJoin(jwtPath, `jwt.key${pub ? '.pub' : ''}`);

    if (!pathAbsolute(jwtPath)) {
      jwtPath = pathJoin(require.main.path, jwtPath);
    }
    return jwtPath;
  }

  /** JWT path for public key */
  get jwtPublicPath(): string {
    return this.getJWT(true);
  }
  /** JWT path for private key */
  get jwtPrivatePath(): string {
    return this.getJWT(false);
  }

  /** Get information about provider */
  getProvider(
    providerType: AuthProviders,
  ): {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
  } {
    return this.get(`providers.${providerType}`);
  }

  /** Get expiry of access and refresh token */
  get expiry(): {
    accessExpiry: number;
    refreshExpiry: number;
  } {
    return {
      accessExpiry: this.production ? ms('15m') : ms('1d'), //15 min for production, 1 day for dev
      refreshExpiry: ms('7d'), // A week
    };
  }

  /** Get cookie names of tokens */
  get cookieNames() {
    return {
      access: 'accesstoken',
      refresh: 'refreshtoken',
    };
  }

  /** Get cookie settings */
  get cookieSettings(): {
    access: CookieSettings;
    refresh: CookieSettings;
  } {
    return {
      access: {
        expires: new Date(Date.now() + this.expiry.accessExpiry),
        httpOnly: true,
        sameSite: 'strict',
        // sameSite: this.production ? 'Strict' : false,
        path: '/',
        secure: this.production,
      },
      refresh: {
        expires: new Date(Date.now() + this.expiry.refreshExpiry),
        httpOnly: true,
        sameSite: 'strict',
        // sameSite: this.production ? 'Strict' : false,
        path: '/auth/refresh',
        secure: this.production,
      },
    };
  }
}

/** Load config from yaml file and validate it */
export function loadConfig() {
  let cfgPath = process.env.CONFIG_PATH || '../env.yml';
  if (!cfgPath) {
    throw new Error('Config path not found in env: CONFIG_PATH');
  }
  if (!pathAbsolute(cfgPath)) {
    cfgPath = pathJoin(require.main.path, cfgPath);
  }
  if (!existsSync(cfgPath)) {
    throw new Error('Config file could not be found at path: ' + cfgPath);
  }

  let yamlLoaded = yaml.load(readFileSync(cfgPath, 'utf8')) as object;
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

export const corsSettings = {
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  origin: (org, cb) => {
    // if (['http://localhost:8080'].includes(org)) {
    cb(null, true);
    // } else {
    //   cb(new Error(`Origin: ${org} is not whitelisted`));
    // }
  },
  credentials: true,
};
