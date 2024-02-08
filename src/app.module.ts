import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { DataSourceConfig } from './config/data.source';
import { AuthModule } from './auth/auth.module';
import { TabuladorModule } from './tabulador/tabulador.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    UsersModule,
    TabuladorModule,
    AuthModule,
  ],
})
export class AppModule {}
