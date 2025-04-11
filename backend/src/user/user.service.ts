import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

/**
 * Service responsible for managing user-related operations in the system.
 * Handles user creation, retrieval, and profile updates.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  
  /**
   * Creates an instance of UserService.
   * 
   * @param userRepo - Repository for User entities
   */
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

    /**
     * Finds a teacher by their email address with related courses.
     * 
     * @param email - The email address of the teacher to find
     * @returns The found teacher entity or null if not found
     */
    async findTeacherByEmail(email: string) {
      this.logger.log(`Searching for teacher with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email: email, role: UserRole.Teacher },
        relations: ['courses'],
      });
    }

    /**
     * Finds a student with specified relations.
     * 
     * @param options - Query options including where clause and relations to include
     * @returns The found student entity or null if not found
     */
    async findStudentWithRelations(options: { where: { email: string }; relations: string[] }) {
      this.logger.log(`Searching for student with email: ${options.where.email}`);
      return await this.userRepo.findOne({
        where: options.where,
        relations: options.relations, 
      });
    }
  
    /**
     * Finds a student by their email address with related course enrollments.
     * 
     * @param email - The email address of the student to find
     * @returns The found student entity or null if not found
     */
    async findStudentByEmail(email: string) {
      this.logger.log(`Searching for student with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email: email, role: UserRole.Student },
        relations: ['enrolledCourses', 'enrolledCourses.course'],
      });
    }
    
    /**
     * Finds any user by their email address with related courses and enrollments.
     * 
     * @param email - The email address of the user to find
     * @returns The found user entity or null if not found
     */
    async findByEmail(email: string) {
      this.logger.log(`Searching for user with email: ${email}`);
      return await this.userRepo.findOne({
        where: { email },
        relations: ['courses', 'enrolledCourses', 'enrolledCourses.course'],
       });
    }
    
    /**
     * Creates a new user in the system.
     * 
     * @param email - The email address for the new user
     * @param firstName - The first name of the new user
     * @param lastName - The last name of the new user
     * @param password - The password for the new user (will be hashed)
     * @param role - The role of the new user (Student or Teacher)
     * @param image - Optional profile image URL for the new user
     * @returns The newly created user entity
     * @throws BadRequestException if the email is already in use
     */
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

    /**
     * Updates a user's password.
     * 
     * @param email - The email address of the user
     * @param newPassword - The new password to set (will be hashed)
     * @returns The updated user entity
     * @throws NotFoundException if no user is found with the given email
     */
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

    /**
     * Updates a user's email address.
     * 
     * @param email - The current email address of the user
     * @param newEmail - The new email address to set
     * @returns The updated user entity
     * @throws BadRequestException if the new email is the same as the current one
     * @throws BadRequestException if the new email is already in use
     * @throws NotFoundException if no user is found with the given email
     */
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
