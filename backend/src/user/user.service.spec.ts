import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import * as bcrypt from 'bcryptjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepo: any;

  beforeEach(async () => {
    const mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should create a new user successfully', async () => {
    const email = 'test@example.com';
    const firstName = 'John';
    const lastName = 'Doe';
    const password = 'password123';
    const hashedPassword = 'hashed123';
    const role = UserRole.Student
    
    const mockUser: User = {
      id: 1,
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: UserRole.Student,
      image: process.env.DEFAULT_USER_IMAGE as string
    };

    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

    userRepo.findOne.mockResolvedValue(null);

    userRepo.create.mockReturnValue(mockUser);
    userRepo.save.mockResolvedValue(mockUser);

    const result = await service.createUser(email, firstName, lastName, password, role, process.env.DEFAULT_USER_IMAGE);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(userRepo.create).toHaveBeenCalledWith({
      email,
      firstName,
      lastName,
      role,
      password: hashedPassword,
      image: process.env.DEFAULT_USER_IMAGE,
    });
    expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual(mockUser);
  });

  it('should update the password successfully', async () => {
    const email = 'test@example.com';
    const newPassword = 'newPassword123';
    const hashedPassword = 'hashedNewPassword';
    const mockUser: User = {
      id: 1,
      email,
      firstName: 'John',
      lastName: 'Doe',
      password: 'oldPassword',
      role: UserRole.Student,
      image: process.env.DEFAULT_USER_IMAGE as string
    };

    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

    userRepo.findOne.mockResolvedValue(mockUser);

    userRepo.save.mockResolvedValue({ ...mockUser, password: hashedPassword });

    const result = await service.updatePassword(email, newPassword);

    expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    expect(userRepo.save).toHaveBeenCalledWith({ ...mockUser, password: hashedPassword });
    expect(result).toEqual({ ...mockUser, password: hashedPassword });
  });
});
