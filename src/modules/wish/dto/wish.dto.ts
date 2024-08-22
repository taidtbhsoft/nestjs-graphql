import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateWishInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Content must be at least 6 characters long.' })
  content: string;
}

@InputType()
export class WishIdInput {
  @Field(() => String)
  @IsNotEmpty()
  id: string;
}
