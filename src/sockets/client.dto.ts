import { AuthProviders } from 'src/models';

/** Information to identify a socket with a user */
export class IngestClientDTO {
  /** Id of user */
  userUid: string;
  /** Provider name */
  dataProvider: AuthProviders;
}
