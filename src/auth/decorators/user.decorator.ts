import { createParamDecorator } from '@nestjs/common';
import { UserSession } from '../interfaces/user-session.interface';

export const User = createParamDecorator<UserSession>((data, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserSession;
});
