import { AuthRole } from '../../models/enums';

export interface AuthTokenPayload {
  /**
   * The unique ID provided by this application
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
