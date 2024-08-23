import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { GetWishType, Wish } from './wish.entity';
import { CreateWishInput } from './dto/wish.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WishService {
  constructor(
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
  ) {}

  async findAll(): Promise<GetWishType> {
    const [data = [], count = 0] = await this.wishRepository.findAndCount({
      relations: ['user'],
    });
    return { data, count };
  }

  findOne(id: string): Promise<Wish> {
    return this.wishRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async create(input: CreateWishInput): Promise<Wish> {
    try {
      const user = this.wishRepository.create(input);
      return await this.wishRepository.save(user);
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async update(id: string, input: CreateWishInput): Promise<Wish> {
    const wishData = await this.wishRepository.findOneBy({ id });

    if (!wishData) {
      throw new NotFoundException(`Could not find with id: ${id}`);
    }
    const wish = await this.wishRepository.create(input);
    await this.wishRepository.update(id, wish);
    return await this.wishRepository.findOneBy({ id });
  }

  delete(id: string) {
    return this.wishRepository.delete({ id });
  }
}
