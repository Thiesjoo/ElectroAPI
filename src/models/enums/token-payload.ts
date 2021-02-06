import { AuthRole } from '.';

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

export interface RefreshTokenPayload extends AuthTokenPayload {
  /**
   * The actual token used for refreshing
   */
  jti: string;
}

export interface RefreshToken {
  jti: string;
  expires: number;
  revoked: boolean;
}
