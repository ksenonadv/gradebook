import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(email: string, firstName: string, lastName: string, password: string) {
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.userRepo.findOne({ where: { email } });

    if (existingUser) {
      throw new InternalServerErrorException(
        'Email already in use'
      );
    }

    const user = this.userRepo.create({ 
      email, 
      firstName,
      lastName,
      password: hashedPassword 
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
}
