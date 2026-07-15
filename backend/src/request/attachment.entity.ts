import {
  Entity, Column, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Request } from '../request/request.entity';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 512 })
  file_path: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'integer' })
  size_bytes: number;

  @Column({ type: 'uuid' })
  uploaded_by: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @ManyToOne(() => Request, request => request.attachments, {
    nullable: true,
    onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'request_id' })
    request: Request;

    @Column({ nullable: true })
    request_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}