import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { RoleType } from '../constants/role-type';
import { RolesGuard } from './roles.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
export function Roles(roles: RoleType[] = []): MethodDecorator {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}

export function AuthUser() {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const { user = null } =
      GqlExecutionContext.create(context).getContext().req;

    return user;
  })();
}
