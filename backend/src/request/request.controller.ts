import {
  Body, Controller, Delete, Get, Param, Patch,
  Post, Query, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';
import { RequestService } from './request.service';
import {
  CreateRequestDto, UpdateRequestStatusDto,
  AddCommentDto, AddAttachmentsDto, FilterRequestsDto,
} from './request.dto';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '[Agent] Submit a new administrative request' })
  @ApiCreatedResponse({ description: 'Request created successfully.' })
  create(@Body() dto: CreateRequestDto, @CurrentUser() currentUser: User) {
    return this.requestService.createRequest(dto, currentUser);
  }

  @Get('my')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Get own request history (paginated + filtered)' })
  getMyRequests(@Query() filters: FilterRequestsDto, @CurrentUser() currentUser: User) {
    return this.requestService.findByUser(currentUser.id, filters);
  }

  @Get('my/stats')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Get personal dashboard statistics' })
  getMyStats(@CurrentUser() currentUser: User) {
    return this.requestService.getAgentStats(currentUser.id);
  }

  @Get('my/:id')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Get one of own requests by id' })
  @ApiParam({ name: 'id', type: String })
  getMyRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.requestService.findOne(id, currentUser);
  }

  @Post(':id/comments')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Agent / Admin] Append a comment to an open request' })
  @ApiParam({ name: 'id', type: String })
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.addComment(id, dto, currentUser);
  }

  @Post(':id/attachments')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Agent] Attach files to an open request' })
  @ApiParam({ name: 'id', type: String })
  addAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddAttachmentsDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.addAttachments(id, dto, currentUser);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Confirm an accepted request' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Request confirmed.' })
  confirmRequest(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.requestService.comfirmRequest(id, currentUser);
  }
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get all requests filter by type, agent, date, status' })
  findAll(@Query() filters: FilterRequestsDto) {
    return this.requestService.findAll(filters);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get global dashboard statistics' })
  getAdminStats() {
    return this.requestService.getAdminStats();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get any request by id' })
  @ApiParam({ name: 'id', type: String })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: User) {
    return this.requestService.findOne(id, currentUser);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Update request status + optional observation' })
  @ApiParam({ name: 'id', type: String })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.updateStatus(id, dto, currentUser);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Super-Admin] Hard-delete a request record' })
  @ApiParam({ name: 'id', type: String })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.remove(id);
  }
}