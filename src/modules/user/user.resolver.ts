import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './user.entity';
import { UserService } from './user.service';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User])
  getManyUserList() {
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
  updateRecipe(
    @Args('id') id: string,
    @Args('updateUserData') updateUserData: UpdateUserInput,
  ) {
    return this.userService.update(id, updateUserData);
  }

  @Mutation(() => Boolean)
  deleteRecipe(@Args('id', { type: () => String }) id: string) {
    return this.userService.delete(id).then(() => true);
  }
}
