import {
  applyDecorators,
  CustomDecorator,
  HttpStatus,
  SetMetadata,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthRole } from '../../models/enums';

/**
 * Custom decorater for JWT Guard
 * @param roles The roles to set
 */
const Role = (roles: AuthRole) => SetMetadata('roles', roles);

export const DeveloperOnly = () => Role(AuthRole.Developer);
export const AuthedUser = () => Role(AuthRole.User);
export const BannedUsers = () => Role(AuthRole.Banned);

/**
 * Add all required response auth prefixes to a controller
 */
export function AuthPrefixes(extraGuards, extraDecorators: CustomDecorator[]) {
  return applyDecorators(
    ApiBearerAuth(),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description:
        'Whenever the bearer token is missing, the request will be denied',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description:
        'The roles of the user did not match any of the allowed roles',
    }),
    UseGuards(extraGuards),
    ...extraDecorators,
  );
}
