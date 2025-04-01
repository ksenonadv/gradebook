import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/entities/user.entity';

describe('AuthService - register', () => {
  
  let authService: AuthService;
  let userService: any;
  let emailService: any;
  let jwtService: any;

  beforeEach(async () => {
    const mockUserService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockEmailService = {
      sendResetPasswordLink: jest.fn(),
      decodeConfirmationToken: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mockToken'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should register a user successfully', async () => {
    const email = 'test@example.com';
    const firstName = 'John';
    const lastName = 'Doe';
    const password = 'password123';

    userService.createUser.mockResolvedValue(undefined);

    const result = await authService.register(email, firstName, lastName, password);

    expect(userService.createUser).toHaveBeenCalledWith(email, firstName, lastName, password, UserRole.Student, process.env.DEFAULT_USER_IMAGE);
    expect(result).toEqual({ message: 'You are now registered' });
  });

  it('should reset the password successfully', async () => {
    const email = 'test@example.com';
    const token = 'validToken';
    const newPassword = 'newPassword123';

    emailService.decodeConfirmationToken.mockResolvedValue(email);
    userService.updatePassword.mockResolvedValue(undefined);

    const result = await authService.resetPassword(token, newPassword);

    expect(emailService.decodeConfirmationToken).toHaveBeenCalledWith(token);
    expect(userService.updatePassword).toHaveBeenCalledWith(email, newPassword);
    expect(result).toEqual({ message: 'Password changed' });
  });

});
