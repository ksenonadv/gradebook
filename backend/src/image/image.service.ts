import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService
      ) {}

    async changeImage(email: string, image: string){
        const user = await this.userRepo.findOne({ 
            where: { 
              email 
            } 
        });
        
        if (!user) {
              throw new UnauthorizedException(
                `No user found for email: ${email}`
              );
        }

        user.image = image;
        await this.userRepo.save(
           user
        );

        const newToken = this.jwtService.sign({ 
            id: user.id, 
        });
        return {
            message: "Image changed",
            token: newToken
        }
    }
}
