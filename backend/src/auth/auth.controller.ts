import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty } from 'class-validator';

class RegisterDto {
  
  @IsEmail()
  email: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  password: string;
}

class LoginDto {
  
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  
  constructor(
    private authService: AuthService
  ) { }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.email, 
      body.firstName,
      body.lastName,
      body.password
    );
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(
      body.email, 
      body.password
    );
  }
}