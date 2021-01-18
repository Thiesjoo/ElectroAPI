import { SetMetadata } from '@nestjs/common';
import { AuthRole } from '../enums';

/**
 * Custom decorater for JWT Guard
 * @param roles The roles to set
 */
const Role = (roles: AuthRole) => SetMetadata('roles', roles);

export const DeveloperOnly = () => Role(AuthRole.Developer);
export const AuthedUser = () => Role(AuthRole.User);
export const BannedUsers = () => Role(AuthRole.Banned);
