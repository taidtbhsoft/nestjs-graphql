import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { User } from '@modules/user/user.entity';

@InputType()
export class LoginUserInput {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;
}

@ObjectType()
export class LoginOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => String, { nullable: true })
  refreshToken?: string;
}

@ObjectType()
export class GetTokenOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
