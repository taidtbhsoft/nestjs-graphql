import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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

  async verifyToken(token: string): Promise<User> {
    const decode = this.jwtService.decode(token);
    if (!decode) {
      throw new UnauthorizedException('Token invalid');
    }
    if (Date.now() >= decode.exp * 1000) {
      throw new UnauthorizedException('Token expired');
    }
    const user = await this.usersService.findOne(decode.id);
    if (!user) {
      throw new UnauthorizedException('Not found user');
    }
    return user;
  }
}
