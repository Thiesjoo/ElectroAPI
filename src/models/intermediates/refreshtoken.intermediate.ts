/**
 * The token that is stored in the DB
 */
export class RefreshToken {
  /** The JWT Id */
  jti: string;
  /** Expiry in unix time */
  expires: number;
  /** Token revocation status */
  revoked: boolean;
}
