import {
  Body, Controller, Delete, Get,
  Param, ParseUUIDPipe, Patch, Post, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { RequestTypeService } from './request_type.service';
import {
  CreateRequestTypeDto,
  UpdateRequestTypeDto,
  CreateFieldDto,
} from './request_type.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Request Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('request-types')
export class RequestTypeController {
  constructor(private readonly requestTypeService: RequestTypeService) {}

  // Super-admin: create type + fields in one shot
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Create a request type with its fields' })
  create(@Body() dto: CreateRequestTypeDto) {
    return this.requestTypeService.createRequestType(dto);
  }

  // Agents: list active types to populate the request form
  @Get()
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[All] Get all active request types' })
  findAll() {
    return this.requestTypeService.findAll();
  }

  // Super-admin: see all including inactive
  @Get('admin/all')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Get all request types including inactive' })
  findAllAdmin() {
    return this.requestTypeService.findAllAdmin();
  }

  // Get one with all its fields
  @Get(':id')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[All] Get one request type with its fields' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestTypeService.findOne(id);
  }

  // Super-admin: update name / description / isActive
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Update request type metadata' })
  @ApiParam({ name: 'id', type: String })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRequestTypeDto) {
    return this.requestTypeService.update(id, dto);
  }

  // Super-admin: add more fields to an existing type
  @Post(':id/fields')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Add fields to an existing request type' })
  @ApiParam({ name: 'id', type: String })
  addFields(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateFieldDto[]) {
    return this.requestTypeService.addFields(id, dto);
  }

  // Super-admin: remove a single field
  @Delete('fields/:fieldId')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Remove a field from a request type' })
  @ApiParam({ name: 'fieldId', type: String })
  removeField(@Param('fieldId', ParseUUIDPipe) fieldId: string) {
    return this.requestTypeService.removeField(fieldId);
  }

  // Super-admin: delete entire type
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Delete a request type' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestTypeService.remove(id);
  }
}