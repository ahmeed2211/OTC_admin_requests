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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import {User} from './user.entity'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '[SuperAdmin] Create a new user' })
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: User ) {
    return this.userService.createUser(createUserDto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: '[SuperAdmin] Get all users, optionally filtered by role' })
  @ApiQuery({ name: 'role', enum: UserRole, required: false })
  findAll(@Query('role') role?: UserRole) {
    return this.userService.findAll(role);
  }
  @Get(':id')
  @ApiOperation({ summary: '[SuperAdmin] Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }


  @Get(':value')
  @ApiOperation({ summary: '[SuperAdmin] Find user by id, name, email, or phone' })
  @ApiParam({ name: 'value', description: 'id, firstName, lastName, email, or phone' })
  findOne(@Param('value') value: string) {
    return this.userService.findOne(value);
  }

  @Patch(':id')
  @ApiOperation({ summary: '[SuperAdmin] Update user fields' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: User ) {
    return this.userService.updateUser(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: '[SuperAdmin] Delete a user' })
  remove(@Param('id') id: string, @CurrentUser() currentUser: User ) {
    return this.userService.deleteUser(id, currentUser);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: '[SuperAdmin] Activate or deactivate a user' })
  toggleActive(@Param('id') id: string, @CurrentUser() currentUser: User ) {
    return this.userService.toggleActivate(id, currentUser);
  }

  @Patch(':id/reset-password')
  @Roles(UserRole.AGENT)
  @ApiOperation({ summary: '[SuperAdmin] Reset a user password' })
  resetPassword(
    @Param('id') id: string,
    @Body('password') oldpassword: string,
    @Body('password') newpassword: string,
    @CurrentUser() currentUser: User 
  ) {
    return this.userService.resetPassword(id, oldpassword, newpassword, currentUser);
  }
}