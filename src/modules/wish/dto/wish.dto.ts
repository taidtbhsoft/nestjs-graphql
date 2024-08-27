import { Field, InputType } from '@nestjs/graphql';
import { StringOrNumberScalar } from '@src/common/scalars/stringOrNumber.scalars';

import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

@InputType()
export class GetWishListInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  userId?: string;

  @Field(() => StringOrNumberScalar, { nullable: true })
  @IsOptional()
  skip?: number;

  @Field(() => StringOrNumberScalar, { nullable: true })
  @IsOptional()
  take?: number;
}
