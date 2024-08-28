import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { UserModule } from '@modules/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { GraphQLError } from 'graphql';
import { setHttpPlugin } from '@common/utils/graphql.helper';
import { initDB } from '@common/config/database.config';
import { WishModule } from '@modules/wish/wish.module';
import { StringOrNumberScalar } from './common/scalars/stringOrNumber.scalars';
import { RoleTypeScalar } from './common/scalars/roleType.scalars';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanUpTokensService } from './cron/cleanUpTokens.cron';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      autoTransformHttpErrors: true,
      installSubscriptionHandlers: true, // Add subscription
      formatError: (error: GraphQLError) => {
        return {
          message:
            error?.extensions?.originalError?.['message'] ||
            error.message ||
            '',
          path: error.path,
          statusCode: error?.extensions?.originalError?.['statusCode'] || 400,
        };
      },
      plugins: [setHttpPlugin],
      subscriptions: {
        'graphql-ws': true, // this enables graphql subscriptions
      },
    }),
    ...initDB,
    UserModule,
    AuthModule,
    WishModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    StringOrNumberScalar,
    RoleTypeScalar,
    CleanUpTokensService,
  ],
})
export class AppModule {}
