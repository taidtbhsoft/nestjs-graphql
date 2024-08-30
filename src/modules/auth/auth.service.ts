import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@modules/user/user.service';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { GetTokenOutput, LoginOutput, LoginUserInput } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterUserInput } from './dto/register.dto';
import { User } from '../user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tokens } from './token.entity';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectRepository(Tokens)
    private tokenRepository: Repository<Tokens>,
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
    const tokenData = { id: user.id, username };
    const token = this.jwtService.sign(tokenData);
    const refreshToken = this.jwtService.sign(tokenData, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRED || '14d',
    });

    const newToken = {
      token,
      refreshToken,
      userId: user.id,
      expToken: this.jwtService.decode(token).exp,
      expRefreshToken: this.jwtService.decode(refreshToken).exp,
    } as Partial<Tokens>;
    this.tokenRepository.save(newToken);
    return { token, user, refreshToken };
  }

  async register(registerUserInput: RegisterUserInput): Promise<User> {
    return await this.usersService.create(registerUserInput);
  }

  async verifyToken(token: string, options?: JwtVerifyOptions): Promise<User> {
    let decode = null;
    try {
      decode = this.jwtService.verify(token, options);
    } catch {}

    if (!decode) {
      throw new UnauthorizedException('Token invalid');
    }
    if (Date.now() >= decode.exp * 1000) {
      throw new UnauthorizedException('Token expired');
    }
    const [user, tokenData] = await Promise.all([
      this.usersService.findOne(decode.id),
      this.tokenRepository.findOne({
        where: [{ token }, { refreshToken: token }],
      }),
    ]);

    if (!tokenData) {
      throw new UnauthorizedException('Token invalid');
    }
    if (!user) {
      throw new UnauthorizedException('Not found user');
    }
    return user;
  }

  async getNewAccessToken(refreshToken: string): Promise<GetTokenOutput> {
    if (!refreshToken) {
      throw new UnauthorizedException('Token invalid');
    }

    const user = await this.verifyToken(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    // Remove old token create by payload refreshToken
    this.tokenRepository.delete({ refreshToken, userId: user.id });

    const tokenData = { id: user.id, username: user.username };
    const token = this.jwtService.sign(tokenData);
    // Add new token not need async for speedup
    const newToken = {
      token,
      refreshToken,
      userId: user.id,
      expToken: this.jwtService.decode(token).exp,
      expRefreshToken: this.jwtService.decode(refreshToken).exp,
    } as Partial<Tokens>;
    this.tokenRepository.save(newToken);

    return { token };
  }

  async logOut(refreshToken: string, userId: string): Promise<boolean> {
    // Remove old token create by payload refreshToken
    this.tokenRepository.delete({ refreshToken, userId });
    return true;
  }

  cleanUpTokens() {
    // CleanUp token expired
    const exp = Date.now();
    this.tokenRepository
      .createQueryBuilder('token')
      .delete()
      .where('expRefreshToken * 1000 <= :exp', { exp })
      .orWhere('expToken * 1000 <= :exp', { exp })
      .execute();
  }
}
