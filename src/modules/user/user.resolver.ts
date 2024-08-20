import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { GetUserType, User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';
import { AuthUser, Roles } from 'src/common/decorators/roles.decorators';

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
  @Mutation(() => User)
  updateUser(
    @Args('id') id: string,
    @Args('updateUserData') updateUserData: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserData);
  }

  @Mutation(() => Boolean)
  deleteUser(@Args('id', { type: () => String }) id: string) {
    return this.userService.delete(id).then(() => true);
  }
}
