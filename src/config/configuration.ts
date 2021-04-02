import { CookieOptions } from 'express';
import { existsSync, readFileSync } from 'fs';
import * as Joi from 'joi';
import * as yaml from 'js-yaml';
import * as loadPkg from 'load-pkg';
import * as ms from 'ms';
import { isAbsolute as pathAbsolute, join as pathJoin } from 'path';
import { AuthProviders } from 'src/models';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

const pkgJSON = loadPkg.sync();

/** Nested validation */
const OauthJoiScheme = Joi.object({
  clientID: Joi.string().required(),
  clientSecret: Joi.string().required(),
  callbackURL: Joi.string().required(),
});

/** Validation for .yml file */
const configValidation = Joi.object({
  mongodb: Joi.object({
    connection: Joi.string().required(),
  })
    .default()
    .required(),
  providers: Joi.object({
    discord: OauthJoiScheme,
  }),
  pusher: Joi.object({
    appId: Joi.string(),
    key: Joi.string(),
    secret: Joi.string(),
  }).required(),
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

  get pusherConfig(): {
    appId: string;
    key: string;
    secret: string;
  } {
    return this.get('pusher');
  }

  /** MongoDatabase url. */
  get mongoURL(): string {
    const db = this.configService.get('mongodb');
    return `${db.connection}/electroapi-${
      this.production ? 'production' : 'dev'
    }`;
  }

  /** Port application should run on */
  get port(): number {
    return this.get('app.port');
  }

  /** Actual version of the application */
  get version(): string {
    const commitSlug = process.env.VERCEL_GIT_COMMIT_SHA;
    return `${pkgJSON?.version || '0.0.0'}${
      commitSlug ? ` (CommitSlug: ${commitSlug})` : ''
    }`;
  }

  /** Get JWT key from file system */
  private getJWT(pub: boolean): string {
    let jwtPath = this.get('app.jwtPath');
    console.log('LOADING JWT KEYS FROM PATH: ', jwtPath);
    if (jwtPath === 'ENV') {
      if (!process.env.PUBKEY || !process.env.PRIVKEY)
        throw new Error('Please set PUBKEY and PRIVKEY in env variables');
      return pub ? process.env.PUBKEY : process.env.PRIVKEY;
    }

    jwtPath = pathJoin(jwtPath, `jwt.key${pub ? '.pub' : ''}`);
    if (!pathAbsolute(jwtPath)) {
      jwtPath = pathJoin(require.main.path, jwtPath);
    }
    return readFileSync(jwtPath, 'utf-8');
  }

  /** JWT path for public key */
  get jwtPublicPath(): string {
    return this.getJWT(true);
  }
  /** JWT path for private key */
  get jwtPrivatePath(): string {
    return this.getJWT(false);
  }

  /** Salt rounds for password encryption */
  get saltRounds(): number {
    return this.production ? 15 : 5;
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
    access: CookieOptions;
    refresh: CookieOptions;
  } {
    return {
      access: {
        expires: new Date(Date.now() + this.expiry.accessExpiry), // Expiry
        httpOnly: true, // JS Cannot access this cookie
        sameSite: 'none', // Cookie can be used from different domains (CORS)
        secure: true, // HTTPS only
        // domain: 'localhost',
      },
      refresh: {
        expires: new Date(Date.now() + this.expiry.refreshExpiry),
        httpOnly: true,
        sameSite: 'none',
        path: '/auth',
        secure: true, // HTTPS only
        // domain: 'localhost',
      },
    };
  }
}

/** Load config from yaml file and validate it */
export function loadConfig() {
  let data = '';

  if (process.env.CONFIG) {
    data = process.env.CONFIG;
    console.log('Loading custom env config. Length: ', data.length);
  } else {
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
    console.log('Loading config from path:', cfgPath);
    data = readFileSync(cfgPath, 'utf8');
  }

  const yamlLoaded = yaml.load(data) as object;
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

export const corsSettings: CorsOptions = {
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  origin: (org, cb) => {
    //FIXME: Make this secure (:
    if (
      [
        'http://localhost:3000',
        'http://localhost:4200',
        'https://electro-dash.vercel.app',
        undefined,
      ].includes(org)
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Origin: ${org} is not whitelisted`));
    }
  },
  credentials: true,
};
