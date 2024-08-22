import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { LoginOutput, LoginUserInput } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RegisterUserInput } from './dto/register.dto';
import { User } from '@modules/user/user.entity';

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
}
