import { Module } from '@nestjs/common';

import { WishResolver } from './wish.resolver';
import { WishService } from './wish.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wish } from './wish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wish])],
  providers: [WishResolver, WishService],
  exports: [WishService],
})
export class WishModule {}
