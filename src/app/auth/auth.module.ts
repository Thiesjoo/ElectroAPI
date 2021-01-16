import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalController, LocalStrategy } from './strategies/local/';
import { JwtModule, JwtSecretRequestType } from '@nestjs/jwt';
import * as fs from 'fs';
import { ApiConfigService } from 'src/config/configuration';
import { ConfigurationModule } from 'src/config/configuration.module';

@Module({
  imports: [
    UsersModule,

    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: async (configService: ApiConfigService) => ({
        publicKey: fs.readFileSync(configService.jwtPublic, 'utf8'),
        privateKey: fs.readFileSync(configService.jwtPrivate, 'utf8'),
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
  providers: [AuthService, LocalStrategy],
  controllers: [LocalController],
})
export class AuthModule {}
