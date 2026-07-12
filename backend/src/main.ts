import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Env } from 'src/config/env/env.config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger, ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const isProd = Env.NODE_ENV === 'production'

  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  app.setGlobalPrefix(Env.API_PREFIX)
  app.enableCors()
  app.enableShutdownHooks()

  const config = new DocumentBuilder()
    .setTitle('OTT Streaming API')
    .setDescription(
      `
      OTT Streaming Platform API — 1-bosqich (Postgres + NestJS asosiy CRUD).

      Authentication:
      Use JWT Bearer token.

      Example:
      Authorization: Bearer <access_token>
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addServer(`http://localhost:${Env.PORT}`, 'Local development')
    .addTag('Auth', 'Registration, login, email verification')
    .addTag('Movies', 'Movie catalog CRUD')
    .addTag('Subscriptions', 'Monthly subscription (no auto-billing)')
    .addTag('Tickets', 'Pay-per-view permanent tickets')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup(`${Env.API_PREFIX}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
    },
  })

  if (!isProd) {
    console.log(`Postgres: ${Env.DATABASE_URL ? 'ishlayapti' : 'xato'}`)
    console.log(`Redis: ${Env.REDIS_URL ? 'ishlayapti' : 'xato'}`)
  }

  await app.listen(Env.PORT)

  logger.log(`🚀 Server ishladi: ${Env.PORT}`)
  logger.log(`📖 Swagger: ${Env.API_PREFIX}/docs`)
}

bootstrap()
