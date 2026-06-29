import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module'
import { AuthModule } from 'src/modules/auth/auth.module'

@Module({
  imports: [
    DatabaseModule,
    AuthModule
  ],
})
export class AppModule {}
