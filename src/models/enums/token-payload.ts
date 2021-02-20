import { AuthRole } from './';

/**
 * The JWT encoded auth token payload
 */
export interface AuthTokenPayload {
  /**
   * The unique ID of the user provided by this application
   */
  sub: string;
  /**
   * The role of the user
   */
  rol: AuthRole;
  /**
   * The epoch time of when our JWT was issued by our back-end
   */
  iat?: number;
  /**
   * The epoch time of when our JWT expires
   */
  exp?: number;
}

/**
 * The JWT encoded refresh token payload
 */
export interface RefreshTokenPayload extends AuthTokenPayload {
  /**
   * The actual token used for refreshing. (JWT-id)
   */
  jti: string;
}

/**
 * The token that is stored in the DB
 */
export interface RefreshToken {
  /** The JWT Id */
  jti: string;
  /** Expiry in unix time */
  expires: number;
  /** Token revocation status */
  revoked: boolean;
}
