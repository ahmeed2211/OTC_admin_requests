import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { User } from './user/user.entity';
import { Request } from './request/request.entity';
import { RequestType } from './request_type/request_type.entity';
import databaseConfig from './database/config.type';
import { UserModule } from './user/user.module';
import { RequestModule } from './request/request.module';
import { RequestTypeModule } from './request_type/request_type.module';
import {AuthModule} from './auth/auth.modue';
@Module({
  imports: [
    EventEmitterModule.forRoot(),

    ConfigModule.forRoot({
      isGlobal: true,
      load:[databaseConfig]
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'password'),
        database: configService.get<string>('DATABASE_NAME', 'otc_admin'),
        synchronize: configService.get<string>('DATABASE_SYNCHRONIZE') === 'true',
        entities: [
          User,
          Request,
          RequestType,
        ],
      }),
    }),

    UserModule,
    RequestModule,
    RequestTypeModule,
    AuthModule
  ],
})
export class AppModule {}