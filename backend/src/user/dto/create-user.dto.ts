import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'mohamed.ahmed@otc.tn' })
  @IsEmail() 
  email: string;
  @ApiProperty() 
  @IsString() 
  firstName: string;
  @ApiProperty() 
  @IsString() 
  lastName: string;
  @ApiProperty({ minLength: 6 }) 
  @IsString() 
  @MinLength(6) 
  password: string;
  @ApiProperty({ enum: UserRole, default: UserRole.AGENT }) 
  @IsEnum(UserRole) role: UserRole;
  @ApiPropertyOptional() 
  @IsOptional() 
  @IsString() 
  department?: string;
  @ApiPropertyOptional() 
  @IsString() 
  phonenumber: string;
}
