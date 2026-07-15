import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RequestType } from '../request_type/request_type.entity';
import { RequestFieldValue } from '../request_type/request_field_value.entity';
import { Attachment } from './attachment.entity';

@Entity('Requests')
export class Request {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, generated: 'increment' })
  requestNumber: number;

  @ManyToOne(() => User, { eager: true, nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => RequestType, { eager: true, nullable: false })
  @JoinColumn({ name: 'requestTypeId' })
  requestType: RequestType;

  @Column()
  requestTypeId: string;

  @Column({ default: 'PENDING' })
  requestStatus: string;

  @CreateDateColumn()
  requestDate: Date;

  @Column({ type: 'text', nullable: true })
  requestComment: string;

  @OneToMany(() => Attachment, attachment => attachment.request, {
    cascade: false,
    eager: true,
  })
  attachments: Attachment[];

  @Column({ type: 'simple-array', nullable: true })
  comments: string[];

  @OneToMany(() => RequestFieldValue, (fv) => fv.request, {
    cascade: true,
    eager: true,
  })
  fieldValues: RequestFieldValue[];
}