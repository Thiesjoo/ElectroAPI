import * as fs from 'fs';
import { ApiConfigService } from 'src/config/configuration';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './';
import { Oauth2RefreshService } from './auth-refresh.service';
import {
  DiscordController,
  DiscordStrategy,
  LocalController,
  LocalRefreshService,
  LocalStrategy,
  RefreshController
} from './strategies';
import { AuthUserModule } from './user/auth.user.module';

@Global()
@Module({
  imports: [
    AuthUserModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ApiConfigService) => ({
        publicKey: fs.readFileSync(configService.jwtPublicPath, 'utf8'),
        privateKey: fs.readFileSync(configService.jwtPrivatePath, 'utf8'),
        // TODO: Throw away tokens after version bump?
        signOptions: {
          expiresIn: configService.expiry.accessExpiry, // 10 minutes
          algorithm: 'RS256',
          issuer: `ElectroAPI-v${configService.version}`,
        },
        verifyOptions: {
          algorithms: ['RS256'],
          issuer: `ElectroAPI-v${configService.version}`,
        },
      }),
      inject: [ApiConfigService],
    }),
  ],
  controllers: [LocalController, DiscordController, RefreshController],
  providers: [
    AuthService,
    LocalStrategy,
    DiscordStrategy,
    LocalRefreshService,
    Oauth2RefreshService,
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
