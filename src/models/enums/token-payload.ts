import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from './';

/**
 * The JWT encoded auth token payload
 */
export class AuthTokenPayload {
  /**
   * The unique ID of the user provided by this application
   */
  @ApiProperty()
  sub: string;
  /**
   * The role of the user
   */
  @ApiProperty({ enum: AuthRole, enumName: 'AuthRole' })
  rol: AuthRole;
  /**
   * The epoch time of when our JWT was issued by our back-end
   */
  @ApiProperty()
  iat?: number;
  /**
   * The epoch time of when our JWT expires
   */
  @ApiProperty()
  exp?: number;
}

/**
 * The JWT encoded refresh token payload
 */
export class RefreshTokenPayload extends AuthTokenPayload {
  /**
   * The actual token used for refreshing. (JWT-id)
   */
  @ApiProperty()
  jti: string;
}

/**
 * The token that is stored in the DB
 */
export class RefreshToken {
  /** The JWT Id */
  @ApiProperty()
  jti: string;
  /** Expiry in unix time */
  @ApiProperty()
  expires: number;
  /** Token revocation status */
  @ApiProperty()
  revoked: boolean;
}
