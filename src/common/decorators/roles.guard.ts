import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  MethodNotAllowedException,
  Inject,
} from '@nestjs/common';
import { RoleType } from '../constants/role-type';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@src/modules/auth/auth.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { authorization = '' } =
      ctx.getContext().req.headers || // For Graphql
      ctx.getContext().req?.extra?.request?.headers || // For Subscription/webSocket Graphql
      {};
    if (!authorization) {
      throw new UnauthorizedException();
    }
    const requiredRoles = this.getMetadata<RoleType[]>('roles', context);

    const token = authorization.split(' ')[1];
    const user = await this.authService.verifyToken(token);
    ctx.getContext().req.user = user;
    if (!requiredRoles?.length) {
      return true;
    }
    if (requiredRoles.includes(user.role)) {
      throw new MethodNotAllowedException();
    }
    return true;
  }
  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
