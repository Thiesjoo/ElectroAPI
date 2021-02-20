import { AuthProviders } from '../provider';

/** Information to identify a socket with a user */
export interface IngestClient {
  /** Id of user */
  userUid: string;
  /** Provider name */
  dataProvider: AuthProviders;
}
