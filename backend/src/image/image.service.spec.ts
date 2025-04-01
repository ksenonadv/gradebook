import { Test, TestingModule } from '@nestjs/testing';
import { ImageService } from './image.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

describe('ImageService', () => {
  let service: ImageService;
  let userRepo: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockUserRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    userRepo.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.changeImage('nonexistent@example.com', 'imageBase64'))
      .rejects
      .toThrow(UnauthorizedException);
  });

  it('should update user image and return a new token', async () => {
    const email = 'test@example.com';
    const image = 'newImageBase64';
    const user = { id: 1, email, image: '' };

    userRepo.findOne = jest.fn().mockResolvedValue(user);
    userRepo.save = jest.fn().mockResolvedValue(user);
    jwtService.sign = jest.fn().mockReturnValue('newJwtToken');

    const result = await service.changeImage(email, image);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
    expect(userRepo.save).toHaveBeenCalledWith({ ...user, image });
    expect(jwtService.sign).toHaveBeenCalledWith({ id: user.id });
    expect(result).toEqual({
      message: 'Image changed',
      token: 'newJwtToken',
    });
  });
});
