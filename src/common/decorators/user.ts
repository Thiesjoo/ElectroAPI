import { AuthTokenPayloadDTO } from 'src/models';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Get the user AuthTokenPayload from request */
export const UserToken = createParamDecorator(
  (_, ctx: ExecutionContext): AuthTokenPayloadDTO => {
    const request = ctx.switchToHttp().getRequest();
    return <AuthTokenPayloadDTO>request.user;
  },
);
