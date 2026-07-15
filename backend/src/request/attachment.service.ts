import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './attachment.entity';
import { Request } from '../request/request.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ALLOWED_MIME_TYPES, MAX_SIZE_BYTES } from '../common/attachment';
import { User } from '../user/user.entity';
import { UserRole } from '../common/enums';
import { isAbsolute, join } from 'path';
import { UPLOAD_DIR } from '../common/multer.config';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  async upload(
    file: Express.Multer.File,
    uploadedBy: string,
    requestId: string,
  ): Promise<Attachment> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Type de fichier non autorisé. Types acceptés : PDF, images, Word.',
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        'Fichier trop volumineux. Taille maximale : 10MB.',
      );
    }

    const attachment = this.attachmentRepository.create({
      file_name: file.originalname,
      file_path: file.path,
      mime_type: file.mimetype,
      size_bytes: file.size,
      uploaded_by: uploadedBy,
      request_id: requestId,
    });

    return await this.attachmentRepository.save(attachment);
  }

  async findByRequest(requestId: string): Promise<Attachment[]> {
    return this.attachmentRepository.find({
      where: { request_id: requestId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentRepository.findOne({ where: { id } });
    if (!attachment) throw new NotFoundException(`Attachment "${id}" not found.`);
    return attachment;
  }

  // Throws if currentUser has no right to access this attachment's file.
  private async assertCanAccess(attachment: Attachment, currentUser: User): Promise<void> {
    if (currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN) {
      return;
    }
    // AGENT: only allowed if they own the parent request (or uploaded it themselves)
    if (attachment.uploaded_by === currentUser.id) return;

    if (attachment.request_id) {
      const parentRequest = await this.requestRepository.findOne({
        where: { id: attachment.request_id },
      });
      if (parentRequest && parentRequest.userId === currentUser.id) return;
    }

    throw new ForbiddenException('You do not have access to this file.');
  }


async getFileForServing(id: string, currentUser: User): Promise<Attachment> {
  const attachment = await this.findOne(id);
  await this.assertCanAccess(attachment, currentUser);

  const resolvedPath = isAbsolute(attachment.file_path)
    ? attachment.file_path
    : join(UPLOAD_DIR, attachment.file_path.replace(/^uploads[\\/]/, ''));

  if (!fs.existsSync(resolvedPath)) {
    throw new NotFoundException('Fichier introuvable sur le serveur.');
  }

  return { ...attachment, file_path: resolvedPath };
}

  async delete(id: string, userId: string): Promise<{ message: string }> {
    const attachment = await this.findOne(id);

    if (attachment.uploaded_by !== userId) {
      throw new ForbiddenException('You can only delete your own attachments.');
    }

    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    await this.attachmentRepository.remove(attachment);
    return { message: `Attachment "${attachment.file_name}" deleted.` };
  }
}