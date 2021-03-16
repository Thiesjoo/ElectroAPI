import { existsSync, readFileSync } from 'fs';
import * as Joi from 'joi';
import * as yaml from 'js-yaml';
import * as loadPkg from 'load-pkg';
import * as ms from 'ms';
import { isAbsolute as pathAbsolute, join as pathJoin } from 'path';
import { AuthProviders } from 'src/models';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const pkgJSON = loadPkg.sync();

/** All cookie settings */
interface CookieSettings {
  /** Same site Settings. Should be strict on production */
  sameSite: 'none' | 'strict' | 'lax';
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
    connection: Joi.string().required(),
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
      commitSlug ? ` (Commitid: ${commitSlug})` : ''
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
    access: CookieSettings;
    refresh: CookieSettings;
  } {
    return {
      access: {
        expires: new Date(Date.now() + this.expiry.accessExpiry),
        httpOnly: true,
        sameSite: 'lax',
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

  let yamlLoaded = yaml.load(data) as object;
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
