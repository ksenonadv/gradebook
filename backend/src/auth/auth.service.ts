import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async register(email: string, firstName: string, lastName: string, password: string) {
    this.logger.log(`Attempting to register user with email: ${email}`);

    const defaultImage = process.env.DEFAULT_USER_IMAGE;

    try {
      await this.userService.createUser(
        email,
        firstName,
        lastName,
        password,
        UserRole.Student,
        defaultImage
      );
      this.logger.log(`User registered successfully with email: ${email}`);
      return { message: 'You are now registered' };
    } catch (error) {
      this.logger.error(`Failed to register user with email: ${email}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async login(email: string, password: string) {
    this.logger.log(`Attempting to log in user with email: ${email}`);

    const user = await this.userService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      this.logger.warn(`Failed login attempt for email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      id: user.id,
    });

    this.logger.log(`User logged in successfully with email: ${email}`);
    return {
      token,
    };
  }

  async forgotPassword(email: string) {
    this.logger.log(`Initiating forgot password for email: ${email}`);

    const user = await this.userService.findByEmail(email);

    if (!user) {
      this.logger.warn(`Forgot password failed. No user found for email: ${email}`);
      throw new UnauthorizedException(`No user found for email: ${email}`);
    }

    await this.emailService.sendResetPasswordLink(email);

    this.logger.log(`Reset password link sent to email: ${email}`);
    return {
      message: 'A confirmation link has been sent to your email.',
    };
  }

  async resetPassword(token: string, password: string) {
    this.logger.log(`Resetting password using token`);

    const email = await this.emailService.decodeConfirmationToken(token);

    await this.userService.updatePassword(email, password);

    this.logger.log(`Password reset successfully for email: ${email}`);
    return {
      message: 'Password changed',
    };
  }

  async changeEmail(email: string, newEmail: string) {
    this.logger.log(`Changing email from ${email} to ${newEmail}`);

    await this.userService.updateEmail(email, newEmail);

    const user = await this.userService.findByEmail(newEmail);

    if (!user) {
      this.logger.warn(`Change email failed. No user found for email: ${newEmail}`);
      throw new UnauthorizedException(`No user found for email: ${email}`);
    }

    const newToken = this.jwtService.sign({
      id: user.id,
    });

    this.logger.log(`Email changed successfully from ${email} to ${newEmail}`);
    return {
      message: 'Email changed',
      token: newToken,
    };
  }
}
