import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayload } from '../../models/enums';

export const UserToken = createParamDecorator(
  (_, ctx: ExecutionContext): AuthTokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    return <AuthTokenPayload>request.user;
  },
);
