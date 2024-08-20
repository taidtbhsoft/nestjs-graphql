import { Injectable, NotFoundException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { GetUserType, User } from './user.entity';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<GetUserType> {
    const [data = [], count = 0] = await this.userRepository.findAndCount();
    return { data, count };
  }

  findOne(id: string): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }
  create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(input);

    return this.userRepository.save(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const userData = await this.userRepository.findOneBy({ id });

    if (!userData) {
      throw new NotFoundException(`Could not find with id: ${id}`);
    }
    const user = await this.userRepository.create(input);
    await this.userRepository.update(id, user);
    return await this.userRepository.findOneBy({ id });
  }

  delete(id: string) {
    return this.userRepository.delete({ id });
  }
}
