import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
    let emailService: EmailService;
    let userRepo: any;
    let jwtService: JwtService;

    beforeEach(async () => {
        const mockUserRepo = {
        findOne: jest.fn(),
        };
        
        const mockConfigService = {
            get: jest.fn((key: string) => {
            const mockConfig = {
                EMAIL_USER: 'mockuser@gmail.com',
                EMAIL_PASSWORD: 'mockpassword',
                JWT_VERIFICATION_TOKEN_SECRET: 'mockSecret',
                JWT_VERIFICATION_TOKEN_EXPIRATION_TIME: '3600',
                EMAIL_RESET_PASSWORD_URL: 'http://localhost/reset-password',
            };
            return mockConfig[key];
            }),
        };
        
        const mockJwtService = {
            sign: jest.fn().mockReturnValue('mockToken'),
            verify: jest.fn().mockReturnValue({ email: 'test@example.com' }),
        };
    
        const mockNodemailer = {
            sendMail: jest.fn().mockResolvedValue(true),
        };
    
        jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockNodemailer as any);
    

        const module: TestingModule = await Test.createTestingModule({
        providers: [
            EmailService,
            {
            provide: getRepositoryToken(User),
            useValue: mockUserRepo,
            },
            {
            provide: ConfigService,
            useValue: mockConfigService,
            },
            {
            provide: JwtService,
            useValue: mockJwtService,
            },
        ],
        }).compile();

        emailService = module.get<EmailService>(EmailService);
        userRepo = module.get(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should send a reset password link', async () => {
        const mockUser = { email: 'test@example.com' };
        userRepo.findOne.mockResolvedValue(mockUser);
    
        await emailService.sendResetPasswordLink('test@example.com');
    
        expect(userRepo.findOne).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
    
        expect(jwtService.sign).toHaveBeenCalledWith(
          { email: 'test@example.com' },
        );
    });

    it('should decode a valid token', async () => {
        const decodedEmail = await emailService.decodeConfirmationToken('validToken');
        expect(decodedEmail).toBe('test@example.com');
    });

});
