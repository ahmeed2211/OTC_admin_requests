import {
  Injectable, ConflictException, NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole, AuditAction } from '../common/enums';          
import { User } from './user.entity';
import { AuditLogService } from './audit_log.service';  
import { MailService } from '../notifications/mail.service';  

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
    private readonly mailService: MailService,       
  ) {}

  async createUser(createUserDto: CreateUserDto, currentUser?: User): Promise<User> {
    const plainPassword = createUserDto.password;
    const salt = await bcrypt.genSalt();

    const user = this.userRepository.create({
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, salt),
    });
    const saved = await this.userRepository.save(user);
    this.mailService.sendCredentials(saved, plainPassword).catch(err =>
      console.error('Failed to send credentials email', err),
    );


    // Log CREATE
    await this.auditLogService.log(
      currentUser?.id || 'system',
      AuditAction.CREATE,
      'USER',
      saved.id,
      { email: saved.email, role: saved.role },
    );
    return saved;
  }

  async findAll(role?: UserRole): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user');
    if (role) {
      query.where('user.role = :role', { role });
    }
    const [users, total] = await query.getManyAndCount();
    if (total === 0) {
      throw new NotFoundException('No users were found');
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

  async updateUser(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === UserRole.SUPER_ADMIN && user.id !== currentUser.id) {
      throw new ConflictException('Cannot alter another super admin');
    }

    const oldData = { ...user }; // snapshot before update
    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);

    // Log UPDATE with changed fields
    await this.auditLogService.log(
      currentUser.id,
      AuditAction.UPDATE,
      'USER',
      saved.id,
      {
        old: {
          firstName: oldData.firstName,
          lastName: oldData.lastName,
          email: oldData.email,
          role: oldData.role,
          department: oldData.department,
          isActive: oldData.isActive,
        },
        new: {
          firstName: saved.firstName,
          lastName: saved.lastName,
          email: saved.email,
          role: saved.role,
          department: saved.department,
          isActive: saved.isActive,
        },
      },
    );
    return saved;
  }

  async deleteUser(id: string, currentUser?: User): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ConflictException('Cannot delete a super admin');
    }
    await this.userRepository.remove(user);

    // Log DELETE
    await this.auditLogService.log(
      currentUser?.id || 'system',
      AuditAction.DELETE,
      'USER',
      id,
      { email: user.email, role: user.role },
    );
  }

  async toggleActivate(id: string, currentUser?: User): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    user.isActive = !user.isActive;
    const saved = await this.userRepository.save(user);

    // Log UPDATE (toggle activation)
    await this.auditLogService.log(
      currentUser?.id || 'system',
      AuditAction.UPDATE,
      'USER',
      saved.id,
      { isActive: saved.isActive, toggledBy: currentUser?.id },
    );
    return saved;
  }

  async resetPassword(
    id: string,
    oldPassword: string,
    newPassword: string,
    currentUser?: User,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found.');
    if (user.role === UserRole.SUPER_ADMIN && currentUser?.id !== id) {
      throw new ConflictException('Cannot reset another super admin\'s password');
    }
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new UnauthorizedException('Current password is incorrect.');

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(newPassword, salt);
    await this.userRepository.save(user);

    // Log UPDATE (password reset)
    await this.auditLogService.log(
      currentUser?.id || 'system',
      AuditAction.UPDATE,
      'USER',
      id,
      { action: 'password_reset', performedBy: currentUser?.id },
    );
    return { message: 'Password reset successfully.' };
  }

  async getUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
}