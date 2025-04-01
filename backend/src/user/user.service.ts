import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async findTeacherByEmail(email: string) {
      return await this.userRepo.findOne({ where: { email: email, role: UserRole.Teacher } });
    }
  
    async findStudentByEmail(email: string) {
      return await this.userRepo.findOne({ where: { email: email, role: UserRole.Student } });
    }

    async findByEmail(email: string) {
        return await this.userRepo.findOne({ where: { email } });
    }

    async createUser(email: string, firstName: string, lastName: string, password: string, role: UserRole, image?: string) {
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
          throw new BadRequestException(
            'Email already in use'
        );
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({ 
            email: email, 
            firstName: firstName, 
            lastName: lastName, 
            password: hashedPassword, 
            role: role,
            image: image 
        });
        return await this.userRepo.save(user);
    }

    async updatePassword(email: string, newPassword: string) {
        const user = await this.findByEmail(email);
        if (!user) {
          throw new NotFoundException(`No user found for email: ${email}`);
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
        return await this.userRepo.save(user);
    }

    async updateEmail(email: string, newEmail: string) {
        if (email === newEmail) {
          throw new BadRequestException(
              'The new email must be different from the current email.'
          );
        }

        const existingUser = await this.findByEmail(newEmail);
        if (existingUser) {
          throw new BadRequestException(
            `There is already a user with the email: ${newEmail}`
          );
        }
    
        const user = await this.findByEmail(email);
        if (!user) {
          throw new NotFoundException(`No user found for email: ${email}`);
        }
    
        user.email = newEmail;
        return await this.userRepo.save(user);
    }

}
