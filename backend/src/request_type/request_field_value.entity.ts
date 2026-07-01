import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Request } from '../request/request.entity';
import { RequestTypeField } from './request_type_field.entity';

@Entity('RequestFieldValues')
export class RequestFieldValue {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  value: string;

  @ManyToOne(() => Request, (r) => r.fieldValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestId' })
  request: Request;

  @Column()
  requestId: string;

  @ManyToOne(() => RequestTypeField, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fieldId' })
  field: RequestTypeField;

  @Column()
  fieldId: string;
}