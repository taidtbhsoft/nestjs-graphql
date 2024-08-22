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
  return await app.listen(process.env.PORT);
}
bootstrap();
