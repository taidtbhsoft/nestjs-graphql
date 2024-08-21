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

@Module({
  imports: [
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      autoTransformHttpErrors: true,
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
    }),
    ...initDB,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
