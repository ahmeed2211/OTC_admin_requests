import {
  Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {RequestType} from "./request_type.entity"
import {RequestTypeDto} from "./request_type.dto"

@Injectable()
export class RequestTypeService {
    constructor(@InjectRepository(RequestType) 
    private readonly requestTypeRepository: Repository<RequestType>,){}
    async createRequestType (requestTypeDto : RequestTypeDto) : Promise <RequestType>{
        const exists = await this.requestTypeRepository.findOne({where:{name:requestTypeDto.name}});
        if (exists){
            throw new ConflictException('this request type already exists');
        }
        return this.requestTypeRepository.save(requestTypeDto);
    }
    async findAll() : Promise<RequestType[]>{
        return this.requestTypeRepository.find();
    }
    async findByname(name: string) : Promise<RequestType>{
        const query= this.requestTypeRepository.createQueryBuilder('request_type');
        query.where('LOWER(request_type.name) LIKE LOWER(:name)', {name: `%${name}%`});
        const requestType = await query.getOne();
        if (!requestType){
            throw new NotFoundException('Request type not found');
        }
        return requestType;
    }
    async updateRequestType(id: string, requestTypeDto: RequestTypeDto) : Promise<RequestType>{
        const requestType = await this.requestTypeRepository.findOne({where:{id}});
        if(!requestType){
            throw new NotFoundException("Request type not found");
        }
        Object.assign(requestType, requestTypeDto);
        return this.requestTypeRepository.save(requestType);

    }
    async toggleActivate(id: string) : Promise<RequestType>{
        const requestType = await this.requestTypeRepository.findOne({where:{id}});
        if(!requestType){
            throw new NotFoundException("Request type not found");
        }
        requestType.isActive = !requestType.isActive;
        return this.requestTypeRepository.save(requestType);
    }
    async deleteRequestType(id: string) : Promise<void>{
        const requestType = await this.requestTypeRepository.findOne({where:{id}});
        if(!requestType){
            throw new NotFoundException("Request type not found");
        }
        await this.requestTypeRepository.remove(requestType);
    }
}

