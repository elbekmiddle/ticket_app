import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from 'src/config/env/env.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


    app.setGlobalPrefix(Env!.API_PREFIX)
    app.enableCors()
    app.enableShutdownHooks()

  if(Env?.NODE_ENV === "development"){
    console.log(`Postgres: ${Env!.DATABASE_URL ? 'ishlayapti' : 'xato'}`)
    console.log(`Redis: ${Env!.REDIS_URL ? 'ishlayapti' : 'xato'}`)
  }

  await app.listen(Env!.PORT);
}
bootstrap();
