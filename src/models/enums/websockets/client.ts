import { AuthProviders } from '../provider';

export interface IngestClient {
  userUid: string;
  dataProvider: AuthProviders;
}
