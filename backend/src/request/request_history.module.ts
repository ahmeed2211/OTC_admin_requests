import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestHistory } from './request_history.entity';
import { RequestHistoryService } from './request_history.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestHistory])],
  providers: [RequestHistoryService],
  exports: [RequestHistoryService],
})
export class RequestHistoryModule {}