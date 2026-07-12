import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { Env } from 'src/config/env/env.config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const isProd = Env?.NODE_ENV === 'production'

  const app = await NestFactory.create(AppModule, {
    logger: isProd
      ? ['log', 'error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  })

  app.setGlobalPrefix(Env!.API_PREFIX)
  app.enableCors()
  app.enableShutdownHooks()
  if (isProd) {
    const config = new DocumentBuilder()
      .setTitle('TicketApp API')
      .setDescription(
        `
      TicketApp API documentation.

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
      .addServer(
        `http://localhost:${Env!.PORT}`,
        'Local development',
      )
      // .addServer(
      //   Env!.API_URL || '',
      //   'Production',
      // )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'Users management')
      .addTag('Tickets', 'Ticket operations')
      .build()

    const document = SwaggerModule.createDocument(app, config)

    SwaggerModule.setup(
      `${Env!.API_PREFIX}/docs`,
      app,
      document,
      {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'list',
          filter: true,
          displayRequestDuration: true,
        },
      },
    )
  }

  if (!isProd) {
    console.log(
      `Postgres: ${Env!.DATABASE_URL ? 'ishlayapti' : 'xato'}`
    )

    console.log(
      `Redis: ${Env!.REDIS_URL ? 'ishlayapti' : 'xato'}`
    )
  }

  await app.listen(Env!.PORT)

  logger.log(`🚀 Server ishladi: ${Env!.PORT}`)

  if (isProd) {
    logger.log(
      `📖 Swagger: /${Env!.API_PREFIX}/docs`
    )
  }
}

bootstrap()