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
    // Check if request type already exists
    const exists = await this.requestTypeRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Request type "${dto.name}" already exists.`);
    }

    // Create the request type WITHOUT fields first
    const requestType = this.requestTypeRepository.create({
      name: dto.name,
      description: dto.description,
      isActive: true,
    });

    // Save the request type to generate the ID
    const savedRequestType = await this.requestTypeRepository.save(requestType);

    // Now create fields with the requestTypeId
    const fields = dto.fields.map((fieldDto) => {
      const field = this.fieldRepository.create({
        fieldName: fieldDto.fieldName,
        fieldType: fieldDto.fieldType,
        isRequired: fieldDto.isRequired,
        description: fieldDto.description || '',
        requestTypeId: savedRequestType.id, // This is the key - set the foreign key
      });
      return field;
    });

    // Save all fields
    await this.fieldRepository.save(fields);

    // Return the complete request type with fields
    return this.requestTypeRepository.findOne({
      where: { id: savedRequestType.id },
      relations: {
        fields: true,
      },
    }) as Promise<RequestType>;
  }

  async findAll(): Promise<RequestType[]> {
    return this.requestTypeRepository.find({ 
      where: { isActive: true },
      relations: {
        fields: true,
      },
    });
  }

  async findAllAdmin(): Promise<RequestType[]> {
    return this.requestTypeRepository.find({
      relations: {
        fields: true,
      },
    });
  }

  async findOne(id: string): Promise<RequestType> {
    const rt = await this.requestTypeRepository.findOne({ 
      where: { id },
      relations: {
        fields: true,
      },
    });
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
      this.fieldRepository.create({ 
        ...f, 
        requestTypeId: rt.id 
      }),
    );
    await this.fieldRepository.save(newFields);

    return this.findOne(id);
  }

  async removeField(fieldId: string): Promise<{ message: string }> {
    const field = await this.fieldRepository.findOne({ 
      where: { id: fieldId } 
    });
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