import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity()
export class Tokens {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: false })
  token: string;

  @Field(() => String)
  @Column({ nullable: false })
  refreshToken: string;

  @Field(() => String)
  @Column({ nullable: false })
  userId: string;

  @Field(() => Number)
  @Column({ nullable: false, type: 'bigint' })
  expToken: number;

  @Field(() => Number)
  @Column({ nullable: false, type: 'bigint' })
  expRefreshToken: number;

  @Field(() => Date)
  @CreateDateColumn({
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
