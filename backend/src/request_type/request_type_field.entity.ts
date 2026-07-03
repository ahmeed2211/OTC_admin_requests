import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { RequestType } from './request_type.entity';

export enum FieldType {
  TEXT  = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN= 'boolean',
  FILE = 'file',
}

@Entity('RequestTypeFields')
export class RequestTypeField {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fieldName: string;

  @Column({ type: 'enum', enum: FieldType })
  fieldType: FieldType;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => RequestType, (rt) => rt.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestTypeId' })
  requestType: RequestType;

  @Column()
  requestTypeId: string;
}