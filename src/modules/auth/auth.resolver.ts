import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GetTokenOutput, LoginOutput, LoginUserInput } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterUserInput } from './dto/register.dto';
import { User } from '@modules/user/user.entity';
import { AuthUser, Roles } from '@src/common/decorators/roles.decorators';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginOutput)
  login(@Args('loginUserInput') loginUserInput: LoginUserInput) {
    return this.authService.login(loginUserInput);
  }

  @Mutation(() => User)
  register(@Args('registerUserInput') registerUserInput: RegisterUserInput) {
    return this.authService.register(registerUserInput);
  }

  @Mutation(() => GetTokenOutput)
  getToken(@Args('refreshToken') refreshToken: string) {
    return this.authService.getNewAccessToken(refreshToken);
  }

  @Roles()
  @Mutation(() => Boolean)
  logOut(@Args('refreshToken') refreshToken: string, @AuthUser() user: User) {
    return this.authService.logOut(refreshToken, user.id);
  }
}
