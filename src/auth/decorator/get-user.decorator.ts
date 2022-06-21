
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const getUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest()
    if (data) {
      console.log(data)
      return request.user[data]
    }
    console.log(data)
    return request.user;
  },
);
