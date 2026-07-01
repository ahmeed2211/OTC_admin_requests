import {
  Entity, PrimaryGeneratedColumn, Column,
  OneToMany, CreateDateColumn,
} from 'typeorm';
import { RequestTypeField } from './request_type_field.entity';

@Entity('RequestTypes')
export class RequestType {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RequestTypeField, (field) => field.requestType, {
    cascade: true,
    eager: true,
  })
  fields: RequestTypeField[];
}