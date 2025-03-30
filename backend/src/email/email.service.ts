import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { User } from '../entities/user.entity';

@Injectable()
export class EmailService {
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
        const payload = { email };

        const token = this.jwtService.sign(
            payload
        );

        const user = await this.userRepo.findOne({ 
            where: { 
              email 
            } 
          });

        const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`;

        const text = `Hi, \nTo reset your password, click here: ${url}`;

        return this.sendMail({
            to: email,
            subject: 'Reset password',
            text
        });
    }

    public async decodeConfirmationToken(token: string) {
        try {
            const payload = await this.jwtService.verify(
                token
            );
    
            if (typeof payload === 'object' && 'email' in payload) {
                return payload.email;
            }
            throw new BadRequestException();
        } catch (error) {
            if (error?.name === 'TokenExpiredError') {
                throw new BadRequestException(
                    'Email confirmation token expired'
                );
            }
            throw new BadRequestException('Bad confirmation token');
        }
    }
}
