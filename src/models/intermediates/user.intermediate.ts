import { AuthRole, ProviderDTO, RefreshToken } from '../';

/** Intermediate schema of User */
export interface IUser {
  /** The DB Uid */
  _id?: string;
  /** The DB Uid */
  id?: string;

  /** Name of User */
  name?: string;
  /** Email address of user */
  email?: string;
  /** Password Hash of User */
  password?: string;

  /** Role of user */
  role?: AuthRole;
  /** Provider information about User */
  providers?: ProviderDTO[];
  /** Refreshtokens of user */
  tokens?: RefreshToken[];
}
