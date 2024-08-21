import { Field, InputType, ObjectType } from '@nestjs/graphql';

import { IsNotEmpty } from 'class-validator';
import { User } from '@modules/user/user.entity';

@InputType()
export class LoginUserInput {
  @Field(() => String)
  @IsNotEmpty()
  username: string;

  @Field(() => String)
  @IsNotEmpty()
  password: string;
}

@ObjectType()
export class LoginOutput {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  token?: string;
}
