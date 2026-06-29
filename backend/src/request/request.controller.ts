import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { RequestService } from './request.service';
import {
  CreateRequestDto,
  UpdateRequestStatusDto,
  AddCommentDto,
  AddAttachmentsDto,
  FilterRequestsDto,
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
  create(
    @Body() createRequestDto: CreateRequestDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.createRequest(createRequestDto, currentUser);
  }

  /**
   * GET /requests/my
   * Agent retrieves their own request history (paginated, filterable).
   */
  @Get('my')
  @Roles(UserRole.AGENT)
  @ApiOperation({
    summary: '[Agent] Get own request history (paginated + filtered)',
  })
  @ApiOkResponse({ description: 'Paginated list of the agent\'s requests.' })
  getMyRequests(
    @Query() filters: FilterRequestsDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.findByUser(currentUser.id, filters);
  }

  /**
   * GET /requests/my/stats
   * Agent retrieves their personal dashboard statistics.
   */
  @Get('my/stats')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Get personal dashboard statistics' })
  @ApiOkResponse({
    description: 'Counts of own requests per status.',
    schema: {
      example: {
        total: 10,
        pending: 3,
        inProgress: 2,
        accepted: 4,
        rejected: 1,
      },
    },
  })
  getMyStats(@CurrentUser() currentUser: User) {
    return this.requestService.getAgentStats(currentUser.id);
  }

  /**
   * GET /requests/my/:id
   * Agent retrieves one of their own requests by id.
   */
  @Get('my/:id')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[Agent] Get one of own requests by id' })
  @ApiParam({ name: 'id', type: String, description: 'Request UUID' })
  @ApiOkResponse({ description: 'Request detail.' })
  getMyRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.findOne(id, currentUser);
  }

  /**
   * POST /requests/:id/comments
   * Agent or Admin appends a comment to an open request.
   */
  @Post(':id/comments')
  @Roles(UserRole.AGENT, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Agent / Admin] Append a comment to an open request',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Comment added; updated request returned.' })
  addComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addCommentDto: AddCommentDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.addComment(id, addCommentDto, currentUser);
  }

  /**
   * POST /requests/:id/attachments
   * Agent adds file attachments to an open request.
   */
  @Post(':id/attachments')
  @Roles(UserRole.AGENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Agent] Attach files to an open request' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Attachments added; updated request returned.' })
  addAttachments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addAttachmentsDto: AddAttachmentsDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.addAttachments(id, addAttachmentsDto, currentUser);
  }
  @Patch(':id/comfirm')
  @Roles(UserRole.AGENT)
  @ApiOperation({
    summary: '[Agent] Confirm an accepted reques',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Comfirm the request after being accepted by admin' })
  ConfirmRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.comfirmRequest(id, currentUser);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ADMIN endpoints
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * GET /requests
   * Admin retrieves all requests (paginated, filterable by type / agent / date / status).
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Admin] Get all requests – filter by type, agent, date, status',
  })
  @ApiOkResponse({ description: 'Paginated list of all requests.' })
  findAll(@Query() filters: FilterRequestsDto) {
    return this.requestService.findAll(filters);
  }

  /**
   * GET /requests/stats
   * Admin retrieves the global dashboard statistics.
   */
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get global dashboard statistics' })
  @ApiOkResponse({
    description: 'Global counts per status + breakdown by request type.',
    schema: {
      example: {
        total: 100,
        pending: 30,
        inProgress: 20,
        accepted: 40,
        rejected: 10,
        byType: [
          { typeName: 'Congé', count: 45 },
          { typeName: 'Attestation de travail', count: 25 },
        ],
      },
    },
  })
  getAdminStats() {
    return this.requestService.getAdminStats();
  }

  /**
   * GET /requests/:id
   * Admin retrieves any request by id.
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[Admin] Get any request by id' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Request detail.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.findOne(id, currentUser);
  }

  /**
   * PATCH /requests/:id/status
   * Admin updates the status of a request and optionally adds an observation.
   */
  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Admin] Update request status + optional admin observation',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Updated request returned.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateRequestStatusDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.requestService.updateStatus(id, updateDto, currentUser);
  }

  /**
   * DELETE /requests/:id
   * Super-admin hard-deletes a request record.
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[Super-Admin] Hard-delete a request record' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Deletion confirmation message.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.requestService.remove(id);
  }
}