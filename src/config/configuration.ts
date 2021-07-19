import { CookieOptions } from 'express';
import { existsSync, readFileSync } from 'fs';
import * as Joi from 'joi';
import * as yaml from 'js-yaml';
import * as loadPkg from 'load-pkg';
import * as ms from 'ms';
import { isAbsolute as pathAbsolute, join as pathJoin } from 'path';
import { AuthProviders, LiveServiceTypes } from 'src/models';
import { Injectable } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

type ProviderConfig = {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
};

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

  get vercel(): boolean {
    return process.env.VERCEL === '1';
  }
  /** Boolean if app is in production */
  get production(): boolean {
    return this.configService.get('NODE_ENV') === 'production';
  }

  get liveGateway(): LiveServiceTypes {
    return this.vercel ? LiveServiceTypes.Pusher : LiveServiceTypes.Sockets;
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

    //JWT's can also be loaded from env
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
  getProvider(providerType: AuthProviders): ProviderConfig {
    const conf = this.get(`providers.${providerType}`) as ProviderConfig;

    if (conf.callbackURL.includes('{{BASEURL}}')) {
      if (process.env.VERCEL_URL) {
        conf.callbackURL = conf.callbackURL.replace(
          '{{BASEURL}}',
          process.env.VERCEL_URL,
        );
        console.log('Replaced callback URL', conf.callbackURL);
      } else {
        throw new Error(
          'Trying to get BASEURL from env, but it is not defined. Please define `VERCEL_URL`',
        );
      }
    }
    return conf;
  }

  /** Get expiry of access and refresh token */
  get expiry(): {
    accessExpiry: number;
    refreshExpiry: number;
  } {
    return {
      accessExpiry: this.production ? ms('15m') : ms('10d'), //15 min for production, 1 day for dev
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
      },
      refresh: {
        expires: new Date(Date.now() + this.expiry.refreshExpiry),
        httpOnly: true,
        sameSite: 'none',
        path: '/auth',
        secure: true, // HTTPS only
      },
    };
  }
}

/** Load config from yaml file and validate it */
export function loadConfig() {
  let data = '';

  if (process.env.CONFIG) {
    //Entire env config
    data = process.env.CONFIG;
    console.log('Loading custom env config. Length: ', data.length);
  } else {
    // Config loaded from file
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
    //FIXME: Make CORS work
    // 1 easy way to fix it would be to host API and Frontend on same domain.
    // This solution is more security through obscurity, because anyone can register a domain on vercel
    if (
      process.env.NODE_ENV !== 'production' ||
      !org || // This is for non CORS requests
      org.endsWith('thies.dev') // This is semi safe, because the frontend will *always* be here
    ) {
      cb(null, org);
    } else {
      cb(new Error(`Origin: ${org} is not whitelisted`));
    }
  },
  credentials: true,
};
