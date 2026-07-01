import {
  Injectable, NotFoundException,
  ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestType } from './request_type.entity';
import { RequestTypeField } from './request_type_field.entity';
import {
  CreateRequestTypeDto,
  UpdateRequestTypeDto,
  CreateFieldDto,
} from './request_type.dto';

@Injectable()
export class RequestTypeService {
  constructor(
    @InjectRepository(RequestType)
    private readonly requestTypeRepository: Repository<RequestType>,
    @InjectRepository(RequestTypeField)
    private readonly fieldRepository: Repository<RequestTypeField>,
  ) {}
  async createRequestType(dto: CreateRequestTypeDto): Promise<RequestType> {
    const exists = await this.requestTypeRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Request type "${dto.name}" already exists.`);
    }

    const requestType = this.requestTypeRepository.create({
      name: dto.name,
      description: dto.description,
      fields: dto.fields.map((f) => this.fieldRepository.create(f)),
    });

    return this.requestTypeRepository.save(requestType);
  }

  async findAll(): Promise<RequestType[]> {
    return this.requestTypeRepository.find({ where: { isActive: true } });
  }
  async findAllAdmin(): Promise<RequestType[]> {
    return this.requestTypeRepository.find();
  }

  async findOne(id: string): Promise<RequestType> {
    const rt = await this.requestTypeRepository.findOne({ where: { id } });
    if (!rt) throw new NotFoundException(`Request type "${id}" not found.`);
    return rt;
  }
  async update(id: string, dto: UpdateRequestTypeDto): Promise<RequestType> {
    const rt = await this.findOne(id);
    Object.assign(rt, dto);
    return this.requestTypeRepository.save(rt);
  }

  async addFields(id: string, fields: CreateFieldDto[]): Promise<RequestType> {
    const rt = await this.findOne(id);

    const newFields = fields.map((f) =>
      this.fieldRepository.create({ ...f, requestTypeId: rt.id }),
    );
    await this.fieldRepository.save(newFields);

    return this.findOne(id); 
  }

  async removeField(fieldId: string): Promise<{ message: string }> {
    const field = await this.fieldRepository.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException(`Field "${fieldId}" not found.`);
    await this.fieldRepository.remove(field);
    return { message: `Field "${field.fieldName}" removed.` };
  }
  async remove(id: string): Promise<{ message: string }> {
    const rt = await this.findOne(id);
    await this.requestTypeRepository.remove(rt);
    return { message: `Request type "${rt.name}" deleted.` };
  }
}