import { Test, TestingModule } from '@nestjs/testing';
import { RequestTypeController } from './request_type.controller';
import { RequestTypeService } from './request_type.service';

describe('RequestTypeController', () => {
  let controller: RequestTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequestTypeController],
      providers: [RequestTypeService],
    }).compile();

    controller = module.get<RequestTypeController>(RequestTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
