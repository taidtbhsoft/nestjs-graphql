import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from '../user.entity';

@InputType()
export class CreateUserInput implements Partial<User> {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  password: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@InputType()
export class UpdateUserInput implements Partial<User> {
  @Field(() => String, { nullable: true })
  @IsOptional()
  password?: string;
}

@InputType()
export class UserIdInput {
  @Field(() => String)
  @IsNotEmpty()
  id: string;
}
