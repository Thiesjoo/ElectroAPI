import { AuthProviders } from '../provider';

export interface IngestClient {
  clientId: string;
  dataProvider: AuthProviders;
}
