import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@ObjectType()
@Entity()
export class Wish {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ nullable: true })
  content: string;

  @Field(() => String)
  @Column({ nullable: false, type: 'uuid' })
  userId: string;

  @Field(() => User)
  @ManyToOne(() => User, (userEntity) => userEntity.wishes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

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

@ObjectType()
export class GetWishType {
  @Field(() => [Wish], { nullable: true })
  data?: Wish[];

  @Field(() => Number, { nullable: true })
  count?: number;
}
