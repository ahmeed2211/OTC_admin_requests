import {
  Controller, Post, Get, Delete, Param,
  UseGuards, UseInterceptors, UploadedFile,
  ParseUUIDPipe, Query, HttpCode, HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  ApiBearerAuth, ApiBody, ApiConsumes,
  ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { User } from '../user/user.entity';
import { UserRole } from '../common/enums';

const storage = diskStorage({
  destination: './uploads',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post('upload')
  @Roles(UserRole.AGENT)
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        requestId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file and attach it to a request' })
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('requestId') requestId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.attachmentService.upload(file, currentUser.id, requestId);
  }

  @Get()
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[All] Get attachments for a request' })
  findByRequest(@Query('requestId') requestId: string) {
    return this.attachmentService.findByRequest(requestId);
  }

  @Get(':id/view')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[All] View a file inline in the browser' })
  @ApiParam({ name: 'id', type: String })
  async view(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() currentUser: User,
  @Res() res: Response,
) {
  const attachment = await this.attachmentService.getFileForServing(id, currentUser);
  res.setHeader('Content-Type', attachment.mime_type);
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${encodeURIComponent(attachment.file_name)}"`,
  );
  res.sendFile(attachment.file_path);
}
  @Get(':id/download')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[All] Download a file' })
  @ApiParam({ name: 'id', type: String })
  async download(
  @Param('id', ParseUUIDPipe) id: string,
  @CurrentUser() currentUser: User,
  @Res() res: Response,
) {
  const attachment = await this.attachmentService.getFileForServing(id, currentUser);
  res.setHeader('Content-Type', attachment.mime_type);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(attachment.file_name)}"`,
  );
  res.sendFile(attachment.file_path);
}

  @Delete(':id')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Agent] Delete own attachment' })
  @ApiParam({ name: 'id', type: String })
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.attachmentService.delete(id, currentUser.id);
  }
}