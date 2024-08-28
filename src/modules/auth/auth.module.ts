import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tokens } from './token.entity';
@Global()
@Module({
  imports: [
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([Tokens]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_SECRET_EXPIRED') || '2h',
        },
        global: true,
      }),
    }),
  ],
  controllers: [],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
