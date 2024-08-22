import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';

import { GetWishType, Wish } from './wish.entity';
import { WishService } from './wish.service';
import { CreateWishInput } from './dto/wish.dto';
import { PubSub } from 'graphql-subscriptions';
const pubSub = new PubSub();
@Resolver()
export class WishResolver {
  constructor(private readonly wishService: WishService) {}

  @Query(() => GetWishType)
  getWishList() {
    return this.wishService.findAll();
  }
  @Query(() => Wish, { nullable: true })
  wish(@Args('id', { type: () => String }) id: string) {
    return this.wishService.findOne(id);
  }

  @Mutation(() => Wish)
  async createWish(@Args('createWishData') createWishData: CreateWishInput) {
    const wish = await this.wishService.create(createWishData);
    pubSub.publish('wishAdded', {
      wishAdded: wish,
    });
    return wish;
  }

  @Mutation(() => Wish)
  updateWish(
    @Args('id') id: string,
    @Args('updateWishData') updateWishData: CreateWishInput,
  ) {
    return this.wishService.update(id, updateWishData);
  }

  @Mutation(() => Boolean)
  deleteWish(@Args('id', { type: () => String }) id: string) {
    return this.wishService.delete(id).then(() => true);
  }

  @Subscription(() => Wish, {
    name: 'wishAdded',
  })
  wishAdded() {
    return pubSub.asyncIterator('wishAdded');
  }
}
