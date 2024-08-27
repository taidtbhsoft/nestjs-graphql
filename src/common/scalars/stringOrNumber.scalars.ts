import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind } from 'graphql';

@Scalar('StringOrNumber')
export class StringOrNumberScalar implements CustomScalar<string, number> {
  description = 'A custom scalar that can be either a string or a number';

  parseValue(value: string): number {
    return +value;
  }

  serialize(value: number): string {
    return value.toString();
  }

  parseLiteral(ast: any): number {
    switch (ast.kind) {
      case Kind.STRING:
        return +ast.value;
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      default:
        throw new Error('Value must be a string or number');
    }
  }
}
