import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from '@modules/user/user.entity';

@InputType()
export class RegisterUserInput {
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
}

@ObjectType()
export class RegisterUserOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;
}
