import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private nodemailerTransport: Mail;

    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) {
        this.nodemailerTransport = createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: configService.get('EMAIL_USER'),
                pass: configService.get('EMAIL_PASSWORD')
            }
        });
    }

    private sendMail(options: Mail.Options) {
        return this.nodemailerTransport.sendMail(options);
    }

    public async sendResetPasswordLink(email: string): Promise<void> {
        this.logger.log(`Attempting to send reset password link to: ${email}`);
        const payload = { email };

        const token = this.jwtService.sign(
            payload
        );

        const user = await this.userRepo.findOne({ 
            where: { 
              email 
            } 
        });

        if (!user) {
            this.logger.warn(`No user found with email: ${email}`);
            throw new BadRequestException('No user found with the provided email');
        }

        const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;

        const text = `Hi, \nTo reset your password, click here: ${url}`;
        
        this.logger.log(`Reset password link successfully sent to: ${email}`);
        return this.sendMail({
            to: email,
            subject: 'Reset password',
            text
        });
    }

    public async decodeConfirmationToken(token: string) {
        this.logger.log(`Attempting to decode confirmation token`);
        try {
            const payload = await this.jwtService.verify(
                token
            );
    
            if (typeof payload === 'object' && 'email' in payload) {
                this.logger.log(`Token decoded successfully. Email: ${payload.email}`);
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                this.logger.warn(`Email confirmation token expired`);
                throw new BadRequestException(
                    'Email confirmation token expired'
                );
            }
            this.logger.error('Bad confirmation token', error.stack);
            throw new BadRequestException('Bad confirmation token');
        }
    }
}
