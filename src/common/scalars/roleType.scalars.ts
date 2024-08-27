import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';
import { RoleType } from '../constants/role-type';

@Scalar('RoleTypeScalar')
export class RoleTypeScalar implements CustomScalar<string, RoleType> {
  description = 'A custom scalar that can be either a string or a RoleType';

  parseValue(value: string): RoleType {
    return RoleType[value] || null;
  }

  serialize(value: RoleType): string {
    return value.toString();
  }

  parseLiteral(ast: any): RoleType {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.ENUM:
        return ast.value as RoleType;
      default:
        throw new Error('Value must be in RoleType');
    }
  }
}
