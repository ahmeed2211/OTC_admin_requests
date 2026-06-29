import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RequestType } from '../request_type/request_type.entity';

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

  @Column({ type: 'simple-array', nullable: true })
  attached_files: string[];

  @Column({ type: 'simple-array', nullable: true })
  comments: string[];

  @Column({nullable: false })
  fromDate: Date;
  
  @Column({nullable: false })
  toDate: Date;
}