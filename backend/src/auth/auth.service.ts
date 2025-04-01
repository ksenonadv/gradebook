import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { UserRole } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async register(email: string, firstName: string, lastName: string, password: string) {
    
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
      return { message: 'You are now registered' };
    } catch (error) {
      if (error instanceof BadRequestException) {
          throw error;
      }
      throw new InternalServerErrorException('Something went wrong');
  }
  }

  async login(email: string, password: string) {
    
    const user = await this.userService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(
        'Invalid credentials'
      );
    }

    const token = this.jwtService.sign({ 
      id: user.id, 
    });

    return { 
      token 
    };
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException(
        `No user found for email: ${email}`
      );
    }
    await this.emailService.sendResetPasswordLink(
      email
    );
    
    return { 
      message: 'A confirmation link has been sent to your email.', 
    };
  }

  async resetPassword(token: string, password: string){
    const email = await this.emailService.decodeConfirmationToken(token);

    await this.userService.updatePassword(email, password);

    return {
      message: "Password changed"
    }
  }

  async changeEmail(email: string, newEmail: string){
    await this.userService.updateEmail(email, newEmail);

    const user = await this.userService.findByEmail(newEmail);

    if (!user) {
      throw new UnauthorizedException(
        `No user found for email: ${email}`
      );
    }

    const newToken = this.jwtService.sign({ 
      id: user.id, 
    });

    return {
      message: "Email changed",
      token: newToken
    }
  }
}
