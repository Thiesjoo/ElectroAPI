import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthTokenPayloadDTO } from '../../models/enums';

/** Get the user AuthTokenPayload from request */
export const UserToken = createParamDecorator(
  (_, ctx: ExecutionContext): AuthTokenPayloadDTO => {
    const request = ctx.switchToHttp().getRequest();
    return <AuthTokenPayloadDTO>request.user;
  },
);
