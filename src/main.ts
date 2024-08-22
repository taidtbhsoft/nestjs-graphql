import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => {
        const msg = errors
          .map((error) => Object.values(error.constraints))
          .flat();
        return new BadRequestException(msg);
      },
    }),
  );
  const port = process.env.PORT;
  const url = `localhost:${port}`;

  console.log(`🚀  Server ready at: http://${url}`);
  console.log(`🚀  GraphQL API ready at: http://${url}/graphql`);
  console.log(`🚀  GraphQL subscriptions ready at: ws://${url}/graphql`);
  return await app.listen(process.env.PORT);
}
bootstrap();
