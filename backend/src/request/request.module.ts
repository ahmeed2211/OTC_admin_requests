import {RequestService} from "./request.service";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {RequestController} from "./request.controller";
import {RequestTypeModule} from "../request_type/request_type.module"
import {User} from "../user/user.entity";
import { Request } from './request.entity';
@Module({
    imports : [
        TypeOrmModule.forFeature([Request, User]),RequestTypeModule,
        EventEmitterModule,],
    providers:[RequestService],
    controllers: [RequestController]

})
export class RequestModule {}
