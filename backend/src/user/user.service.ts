import {
  Injectable, ConflictException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../common/enums';
import { User } from './user.entity';
import {UnauthorizedException}from '@nestjs/common';
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}
    async createUser(createUserDto : CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        const user = this.userRepository.create({...createUserDto,
            password: await bcrypt.hash(createUserDto.password, salt),
        });
        return this.userRepository.save(user);
    }

    async findAll(role?: UserRole): Promise<User[]> {
        const query = this.userRepository.createQueryBuilder('user');
        if (role){
            query.where('user.role = :role', { role });
        }
        const [users, total] = await query.getManyAndCount(); 
        if (total ===0){
            throw new NotFoundException("No users were found");

        }
        return users;
    }
    async findOne(value: string | number): Promise<User | null> {
    return this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.firstName) LIKE LOWER(:search)', { search: `%${value}%` })
        .orWhere('LOWER(user.lastName) LIKE LOWER(:search)', { search: `%${value}%` })
        .orWhere('LOWER(user.email) LIKE LOWER(:search)', { search: `%${value}%` })
        .orWhere('LOWER(user.phonenumber) LIKE LOWER(:search)', { search: `%${value}%` })
        .getOne();
    }
    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    
        const user = await this.userRepository.findOne({where:{id }});
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if(user.role == UserRole.SUPER_ADMIN ){
            throw new ConflictException('Cannot alter another super admin');
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async deleteUser(id: string): Promise<void> {
        const user = await this.findOne(id);
         if (!user) {
            throw new NotFoundException('User not found');
        }
        if(user.role == UserRole.SUPER_ADMIN ){
            throw new ConflictException('Cannot alter another super admin');
        }
        await this.userRepository.remove(user);
    }
    async toggleActivate(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
    }
    async resetPassword(id: string, oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    if(user.role == UserRole.SUPER_ADMIN ){
            throw new ConflictException('Cannot alter another super admin');
        }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new UnauthorizedException('Current password is incorrect.');

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    return { message: 'Password reset successfully.' };
    }
    async getUserById(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        return user;
        }
}