import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuditLogService } from './audit_log.service';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../common/enums';
import { AuditLog } from './audit_log.entity';

@ApiTags('audit-logs')
@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Super Admin] List all audit logs',
    description:
      'Returns all audit activities with user information and detailed JSON context.',
  })
  @ApiQuery({
    name: 'resourceType',
    required: false,
    example: 'REQUEST',
  })
  @ApiResponse({
    status: 200,
    type: [AuditLog],
  })
  findAll(
    @Query('resourceType') resourceType?: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findAll(resourceType);
  }


  @Get('resource/:type/:id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Super Admin] Get history of a specific resource',
    description:
      'Returns all actions performed on a resource (REQUEST, USER, AUTH, etc).',
  })
  @ApiResponse({
    status: 200,
    type: [AuditLog],
  })
  findByResource(
    @Param('type') type: string,
    @Param('id') id: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByResource(type, id);
  }


  @Get('user/:userId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Super Admin] Get activity history of a user',
    description:
      'Returns all actions performed by a specific user.',
  })
  @ApiResponse({
    status: 200,
    type: [AuditLog],
  })
  findByUser(
    @Param('userId') userId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogService.findByUser(userId);
  }


  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Super Admin] Get one audit log entry',
  })
  @ApiResponse({
    status: 200,
    type: AuditLog,
  })
  findOne(
    @Param('id') id: string,
  ): Promise<AuditLog | null> {
    return this.auditLogService.findOne(id);
  }
}