
import { RequestTypeService } from './request_type.service';
import { RequestTypeController } from './request_type.controller';
import {RequestType } from "./request_type.entity"
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {RequestTypeField} from './request_type_field.entity';
import { RequestFieldValue } from './request_field_value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestType, RequestTypeField, RequestFieldValue]),
    EventEmitterModule,],
  controllers: [RequestTypeController],
  providers: [RequestTypeService],
  exports: [TypeOrmModule.forFeature([RequestTypeField, RequestFieldValue])],
})
export class RequestTypeModule {}
