import { Test, TestingModule } from '@nestjs/testing';
import { RequestTypeService } from './request_type.service';

describe('RequestTypeService', () => {
  let service: RequestTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestTypeService],
    }).compile();

    service = module.get<RequestTypeService>(RequestTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
