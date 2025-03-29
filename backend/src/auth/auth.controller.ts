import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

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

class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

class ResetPasswordDto {
  @IsNotEmpty()
  token: string;

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

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Req() req: any) {
    return {
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
    }
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto){
    return this.authService.forgotPassword(
      body.email
    );
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto){
      return this.authService.resetPassword(
        body.token, 
        body.password
      );
  }
}