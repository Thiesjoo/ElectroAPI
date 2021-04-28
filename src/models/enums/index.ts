import { NotificationRoutes } from 'src/sockets';
import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from './authroles';
import { logLevels } from './loglevels';
import { AuthProviders } from './provider';

export * from './authroles';
export * from './provider';
export * from './loglevels';
export * from './token-payload';
export * from './query';

export class MasterEnums {
  @ApiProperty({ enumName: 'AuthRole', enum: AuthRole })
  roles: AuthRole;
  @ApiProperty({ enumName: 'logLevels', enum: logLevels })
  logLevels: logLevels;
  @ApiProperty({ enumName: 'AuthProviders', enum: AuthProviders })
  provider: AuthProviders;
  @ApiProperty({ enumName: 'NotificationRoutes', enum: NotificationRoutes })
  routes: NotificationRoutes;
}
