import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RoleType } from '../constants/role-type';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from 'src/modules/user/user.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { authorization = '' } = ctx.getContext().req.headers || {};
    if (!authorization) {
      return false;
    }
    const requiredRoles = this.getMetadata<RoleType[]>('roles', context);
    const jwtService = new JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '2h',
      },
    });
    const token = authorization.split(' ')[1];
    const decode = jwtService.decode(token);
    const user = await this.usersService.findOne(decode.id);
    ctx.getContext().req.user = user;
    if (!requiredRoles?.length) {
      return true;
    }

    return requiredRoles.includes(user.role);
  }
  private getMetadata<T>(key: string, context: ExecutionContext): T {
    return this.reflector.getAllAndOverride<T>(key, [
      context.getHandler(),
      context.getClass(),
    ]);
  }
}
