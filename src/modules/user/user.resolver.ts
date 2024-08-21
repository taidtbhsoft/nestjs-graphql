import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GetUserType, User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';
import { AuthUser, Roles } from 'src/common/decorators/roles.decorators';
import { RoleType } from 'src/common/constants/role-type';
import { MethodNotAllowedException } from '@nestjs/common';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Roles([])
  @Query(() => GetUserType)
  getUserList(@AuthUser() user: User) {
    // Current user
    console.log({ user });
    return this.userService.findAll();
  }
  @Query(() => User, { nullable: true })
  user(@Args('id', { type: () => String }) id: string) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  createUser(@Args('createUserData') createUserData: CreateUserInput) {
    return this.userService.create(createUserData);
  }

  @Roles()
  @Mutation(() => User)
  updateUser(
    @Args('id') id: string,
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @AuthUser() user: User,
  ) {
    if (user.id !== id && user.role !== RoleType.ADMIN) {
      throw new MethodNotAllowedException(
        `You can not update user with id: ${id}`,
      );
    }
    return this.userService.update(id, updateUserData);
  }

  @Roles()
  @Mutation(() => Boolean)
  deleteUser(
    @Args('id', { type: () => String }) id: string,
    @AuthUser() user: User,
  ) {
    if (user.id !== id && user.role !== RoleType.ADMIN) {
      throw new MethodNotAllowedException(
        `You can not delete user with id: ${id}`,
      );
    }
    return this.userService.delete(id).then(() => true);
  }
}
