import * as fs from 'fs';
import { ApiConfigService } from 'src/config/configuration';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthUserModule } from './auth.user.module';
import {
  DiscordController,
  DiscordStrategy,
  LocalController,
  LocalRefreshService,
  LocalStrategy,
  RefreshController
} from './strategies';

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
  providers: [AuthService, LocalStrategy, DiscordStrategy, LocalRefreshService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
