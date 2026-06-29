
import { RequestTypeService } from './request_type.service';
import { RequestTypeController } from './request_type.controller';
import {RequestType } from "./request_type.entity"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestType]),
    EventEmitterModule,],
  controllers: [RequestTypeController],
  providers: [RequestTypeService],
})
export class RequestTypeModule {}
