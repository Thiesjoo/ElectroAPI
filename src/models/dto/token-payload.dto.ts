import { ApiProperty } from '@nestjs/swagger';
import { AuthRole } from '../enums';

/**
 * The JWT encoded auth token payload
 */
export class AuthTokenPayloadDTO {
  /**
   * The unique ID of the user provided by this application
   */
  sub: string;
  /**
   * The role of the user
   */
  @ApiProperty({ enum: AuthRole, enumName: 'AuthRole' })
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
export class RefreshTokenPayloadDTO extends AuthTokenPayloadDTO {
  /**
   * The actual token used for refreshing. (JWT-id)
   */
  jti: string;
}
