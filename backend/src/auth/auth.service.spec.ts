import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';

describe('AuthService - register', () => {
  
  let authService: AuthService;
  let userRepo: any;

  beforeEach(async () => {
    
    const mockUserRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockToken'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendResetPasswordLink: jest.fn(),
            decodeConfirmationToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should register a user successfully', async () => {
    
    const email = 'test@example.com';
    const firstName = 'John';
    const lastName = 'Doe';
    const password = 'password123';
    const hashedPassword = 'hashed123';

    jest.spyOn(bcrypt, 'hash').mockReturnValue(hashedPassword as any);

    const mockUser = { email, password: hashedPassword, firstName, lastName, role: UserRole.Student };
    userRepo.create.mockReturnValue(mockUser);
    userRepo.findOne = jest.fn().mockResolvedValue(null);
    userRepo.save.mockResolvedValue(mockUser);

    const result = await authService.register(
      email, 
      firstName, 
      lastName, 
      password
    );

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(userRepo.create).toHaveBeenCalledWith({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual({ message: 'You are now registered' });
  });
});
