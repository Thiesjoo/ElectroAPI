import { AuthProviders } from '../models/enums/provider';

/** Information to identify a socket with a user */
export class IngestClientDTO {
  /** Id of user */
  userUid: string;
  /** Provider name */
  dataProvider: AuthProviders;
}
