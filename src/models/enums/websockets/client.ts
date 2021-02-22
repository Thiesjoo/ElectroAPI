
import { ApiProperty } from '@nestjs/swagger';
import { AuthProviders } from '../provider';

/** Information to identify a socket with a user */
export class IngestClient {
  /** Id of user */
  @ApiProperty()
  userUid: string;
  /** Provider name */
  @ApiProperty()
  dataProvider: AuthProviders;
}
