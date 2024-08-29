import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const port = process.env.PORT;
  const url = `localhost:${port}`;

  console.log(`🚀  Server ready at: http://${url}`);
  console.log(`🚀  GraphQL API ready at: http://${url}/graphql`);
  console.log(`🚀  GraphQL subscriptions ready at: ws://${url}/graphql`);
  return await app.listen(process.env.PORT);
}
bootstrap();
