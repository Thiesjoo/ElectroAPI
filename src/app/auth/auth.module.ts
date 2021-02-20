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
      useFactory: async (configService: ApiConfigService) => {
        // TODO: Throw away tokens after version bump?
        const issuer = `ElectroAPI-v${configService.version}`;
        const algorithm = 'RS256';
        const fileEncoding = 'utf8';

        return {
          publicKey: fs.readFileSync(configService.jwtPublicPath, fileEncoding),
          privateKey: fs.readFileSync(
            configService.jwtPrivatePath,
            fileEncoding,
          ),
          signOptions: {
            expiresIn: configService.expiry.accessExpiry,
            algorithm,
            issuer,
          },
          verifyOptions: {
            algorithms: [algorithm],
            issuer,
          },
        };
      },
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
