import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LocalController,
  LocalStrategy,
  DiscordStrategy,
  DiscordController,
} from './strategies';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { ApiConfigService } from 'src/config/configuration';
import { ConfigurationModule } from 'src/config/configuration.module';
import { AuthUserModule } from './auth.user.module';

@Module({
  imports: [
    ConfigurationModule,
    AuthUserModule,
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (configService: ApiConfigService) => ({
        publicKey: fs.readFileSync(configService.jwtPublicPath, 'utf8'),
        privateKey: fs.readFileSync(configService.jwtPrivatePath, 'utf8'),
        // TODO: Throw away tokens after version bump?
        signOptions: {
          expiresIn: 600, // 10 minutes
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
  providers: [AuthService, LocalStrategy, DiscordStrategy],
  controllers: [LocalController, DiscordController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
