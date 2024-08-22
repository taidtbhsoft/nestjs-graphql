import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginOutput, LoginUserInput } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUserInput } from './dto/register.dto';
import { User } from '../user/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginInputDto: LoginUserInput): Promise<LoginOutput> {
    const { username, password } = loginInputDto;
    const user = await this.usersService.findOneByUserName(username);
    if (!user) {
      throw new NotFoundException('Not found user');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password is not correct');
    }
    const token = this.jwtService.sign({ id: user.id, username });

    return { token, user };
  }

  async register(registerUserInput: RegisterUserInput): Promise<User> {
    return await this.usersService.create(registerUserInput);
  }
}
