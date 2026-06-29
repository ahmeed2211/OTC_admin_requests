import { RequestTypeService } from './request_type.service';
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import {UserRole} from '../common/enums';
import { RequestTypeDto } from './request_type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
@ApiTags('Request Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('request-types')
export class RequestTypeController {
  constructor(private readonly requestTypeService: RequestTypeService) {}  
    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[SuperAdmin] Create a new request type(Conge, paternity leave....)' })
    create(@Body() createRequestTypeDto : RequestTypeDto){
      return this.requestTypeService.createRequestType(createRequestTypeDto);
    }
    @Get()
    @ApiOperation({ summary: 'get the available request types' })
    findAll(){
      return this.requestTypeService.findAll();
    }
    @Delete()
    @Roles(UserRole.SUPER_ADMIN)
    @ApiOperation({ summary: '[SuperAdmin] Delete a request type' })
    deleteRequestType(requestId : string){
      return this.requestTypeService.deleteRequestType(requestId);
    }

}
