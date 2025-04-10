import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    async findTeacherByEmail(email: string) {
      this.logger.log(`Searching for teacher with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email: email, role: UserRole.Teacher },
        relations: ['courses'],
      });
    }

    async findStudentWithRelations(options: { where: { email: string }; relations: string[] }) {
      this.logger.log(`Searching for student with email: ${options.where.email}`);
      return await this.userRepo.findOne({
        where: options.where,
        relations: options.relations, 
      });
    }
  
    async findStudentByEmail(email: string) {
      this.logger.log(`Searching for student with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email: email, role: UserRole.Student },
        relations: ['enrolledCourses', 'enrolledCourses.course'],
      });
    }
    
    async findByEmail(email: string) {
      this.logger.log(`Searching for user with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email },
        relations: ['courses', 'enrolledCourses', 'enrolledCourses.course'],
       });
    }
    

    async createUser(email: string, firstName: string, lastName: string, password: string, role: UserRole, image?: string) {
      this.logger.log(`Attempting to create user with email: ${email} and role: ${role}`);
      const existingUser = await this.findByEmail(email);
        if (existingUser) {
          this.logger.warn(`Email already in use: ${email}`);
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
        this.logger.log(`User with email: ${email} created successfully`);
        return await this.userRepo.save(user);
    }

    async updatePassword(email: string, newPassword: string) {
      this.logger.log(`Attempting to update password for user with email: ${email}`);
      const user = await this.findByEmail(email);
        if (!user) {
          this.logger.warn(`No user found for email: ${email}`);
          throw new NotFoundException(`No user found for email: ${email}`);
        }
    
        user.password = await bcrypt.hash(newPassword, 10);
        this.logger.log(`Password for user with email: ${email} updated successfully`);
        return await this.userRepo.save(user);
    }

    async updateEmail(email: string, newEmail: string) {
      this.logger.log(`Attempting to update email for user with email: ${email} to new email: ${newEmail}`);
      if (email === newEmail) {
        this.logger.warn(`New email must be different from the current email: ${email}`);
        throw new BadRequestException(
              'The new email must be different from the current email.'
          );
        }

        const existingUser = await this.findByEmail(newEmail);
        if (existingUser) {
          this.logger.warn(`There is already a user with the email: ${newEmail}`);
          throw new BadRequestException(
            `There is already a user with the email: ${newEmail}`
          );
        }
    
        const user = await this.findByEmail(email);
        if (!user) {
          this.logger.warn(`No user found for email: ${email}`);
          throw new NotFoundException(`No user found for email: ${email}`);
        }
    
        user.email = newEmail;
        this.logger.log(`Email for user with email: ${email} updated to: ${newEmail}`);
        return await this.userRepo.save(user);
    }

}
