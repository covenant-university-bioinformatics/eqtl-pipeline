import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDoc } from '../auth/models/user.model';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDoc => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
