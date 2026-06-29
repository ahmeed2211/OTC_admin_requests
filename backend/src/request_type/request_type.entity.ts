import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('request_types')
export class RequestType {
  @ApiProperty() 
  @PrimaryGeneratedColumn('uuid') 
  id: string;
  @ApiProperty() 
  @Column({ unique: true }) 
  name: string;
  @ApiProperty() 
  @Column({ nullable: true }) 
  description: string;
  @ApiProperty() 
  @Column({ default: true }) 
  isActive: boolean;
  @ApiProperty() 
  @CreateDateColumn() 
  createdAt: Date;
  @ApiProperty() 
  @UpdateDateColumn() 
  updatedAt: Date;
}
