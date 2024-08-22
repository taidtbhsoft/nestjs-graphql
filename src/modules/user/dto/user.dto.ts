import { Field, InputType, registerEnumType } from '@nestjs/graphql';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { User } from '../user.entity';
import { RoleType } from '../../../common/constants/role-type';

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => RoleType, { defaultValue: RoleType.USER })
  @IsOptional()
  role?: RoleType;
}

@InputType()
export class UpdateUserInput implements Partial<User> {
  @Field(() => String, { nullable: true })
  @IsOptional()
  password?: string;

  @Field(() => RoleType, { defaultValue: RoleType.USER })
  @IsOptional()
  role?: RoleType;
}

registerEnumType(RoleType, {
  name: 'RoleType',
});

@InputType()
export class UserIdInput {
  @Field(() => String)
  @IsNotEmpty()
  id: string;
}
