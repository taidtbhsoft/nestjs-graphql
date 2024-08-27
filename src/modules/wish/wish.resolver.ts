import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import { GetWishType, Wish } from './wish.entity';
import { WishService } from './wish.service';
import { CreateWishInput, GetWishListInput } from './dto/wish.dto';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser, Roles } from '@src/common/decorators/roles.decorators';
import { User } from '@modules/user/user.entity';
import { RoleType } from '@src/common/constants/role-type';
import { MethodNotAllowedException } from '@nestjs/common';
const pubSub = new PubSub();
@Resolver()
export class WishResolver {
  constructor(private readonly wishService: WishService) {}

  @Roles()
  @Query(() => GetWishType)
  getWishList(
    @Args('getWishListInput', { nullable: true })
    getWishListInput?: GetWishListInput | null,
  ) {
    const conditions = {
      take: getWishListInput.take,
      skip: getWishListInput.skip,
      where: {},
    };
    if (getWishListInput.userId) {
      conditions.where = { userId: getWishListInput.userId };
    }
    return this.wishService.findAll(conditions);
  }

  @Roles()
  @Query(() => Wish, { nullable: true })
  wish(@Args('id', { type: () => String }) id: string) {
    return this.wishService.findOne(id);
  }

  @Roles()
  @Mutation(() => Wish)
  async createWish(
    @Args('createWishData') createWishData: CreateWishInput,
    @AuthUser() user: User,
  ) {
    const wish = await this.wishService.create({
      ...createWishData,
      userId: user.id,
    } as CreateWishInput & { userId: string });
    pubSub.publish('wishAdded', {
      wishAdded: wish,
    });
    return wish;
  }

  @Roles()
  @Mutation(() => Wish)
  async updateWish(
    @Args('id') id: string,
    @Args('updateWishData') updateWishData: CreateWishInput,
    @AuthUser() user: User,
  ) {
    if (user.id !== id && user.role !== RoleType.ADMIN) {
      throw new MethodNotAllowedException(
        `You can not update user with id: ${id}`,
      );
    }
    const wish = await this.wishService.update(id, updateWishData);
    pubSub.publish('wishUpdated', {
      wishUpdated: wish,
    });
    return wish;
  }

  @Roles()
  @Mutation(() => Boolean)
  async deleteWish(
    @Args('id', { type: () => String }) id: string,
    @AuthUser() user: User,
  ) {
    if (user.id !== id && user.role !== RoleType.ADMIN) {
      throw new MethodNotAllowedException(
        `You can not delete user with id: ${id}`,
      );
    }
    await this.wishService.delete(id).then(() => true);
    pubSub.publish('wishDeleted', {
      wishDeleted: id,
    });
    return true;
  }

  @Roles()
  @Subscription(() => Wish, {
    name: 'wishAdded',
  })
  wishAdded() {
    return pubSub.asyncIterator('wishAdded');
  }

  @Roles()
  @Subscription(() => Wish, {
    name: 'wishUpdated',
  })
  wishUpdated() {
    return pubSub.asyncIterator('wishUpdated');
  }

  @Roles()
  @Subscription(() => String, {
    name: 'wishDeleted',
  })
  wishDeleted() {
    return pubSub.asyncIterator('wishDeleted');
  }
}
