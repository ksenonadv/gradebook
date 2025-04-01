import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async register(email: string, firstName: string, lastName: string, password: string) {
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepo.findOne({ where: { email } });

    const defaultImage = process.env.DEFAULT_USER_IMAGE;

    if (existingUser) {
      throw new InternalServerErrorException(
        'Email already in use'
      );
    }

    const user = this.userRepo.create({ 
      email, 
      firstName,
      lastName,
      password: hashedPassword,
      image: defaultImage
    });

    await this.userRepo.save(
      user
    );

    return { 
      message: 'You are now registered', 
    };
  }

  async login(email: string, password: string) {
    
    const user = await this.userRepo.findOne({ 
      where: { 
        email 
      } 
    });

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
    const user = await this.userRepo.findOne({ 
      where: { 
        email 
      } 
    });
    
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

    const user = await this.userRepo.findOne({ 
      where: { 
        email 
      } 
    });
    
    if (!user) {
      throw new UnauthorizedException(
        `No user found for email: ${email}`
      );
    }

    user.password = await bcrypt.hash(password, 10);
    await this.userRepo.save(
      user
    );

    return {
      message: "Password changed"
    }
  }

  async changeEmail(email: string, newEmail: string){
    if (email === newEmail) {
      throw new BadRequestException(
        'The new email must be different from the current email.'
      );
    }

    const userNewEmail = await this.userRepo.findOne({
       where: {
        email: newEmail
       }
    });
    if(userNewEmail){
      throw new BadRequestException(`
        There is already a user with the email: ${newEmail}`
      );
    }

    const user = await this.userRepo.findOne({
      where: {
        email
      }
    });
    if (!user) {
      throw new UnauthorizedException(
        `No user found for email: ${email}`
      );
    }

    user.email = newEmail;
    await this.userRepo.save(
      user
    );

    const newToken = this.jwtService.sign({ 
      id: user.id, 
    });

    return {
      message: "Email changed",
      token: newToken
    }
  }
}
