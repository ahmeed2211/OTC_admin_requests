import { ApiProperty } from '@nestjs/swagger';

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import {Request} from "../request/request.entity";
import { UserRole } from '../common/enums';
import { IsEnum } from 'class-validator/types/decorator/typechecker/IsEnum';
import { IsOptional } from 'class-validator';

@Entity("Users")
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: false })
    @ApiProperty({ description: 'User name' })
    firstName : string;
    @Column({ unique: false })
    @ApiProperty({ description: 'User last name' })
    lastName : string;
    @Column({unique: true})
    @ApiProperty({ description: 'User email' })
    email: string;
    @Column()
    password: string;
    @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENT})
    @ApiProperty({ enum: UserRole, default: UserRole.AGENT })  
    role: UserRole;
    @Column({default:true})
    isActive: boolean; 
    @OneToMany(() => Request, (request)=> request.user)
    @ApiProperty({ type: () => [Request] })
    requests: Request[];
    @ApiProperty()
    @Column({default : 0})
    totalRequests : number;
    @ApiProperty() 
    @CreateDateColumn() 
    createdAt: Date;
    @ApiProperty() 
    @UpdateDateColumn() 
    updatedAt: Date;
    @ApiProperty()
    @Column({unique: true, nullable: false})
    phonenumber : string;
    @ApiProperty() 
    @Column({ nullable: true }) department: string;


}