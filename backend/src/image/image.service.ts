import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);
  constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService
      ) {}

    async changeImage(email: string, image: string){
      this.logger.log(`Attempting to change image for user with email: ${email}`);
      const user = await this.userRepo.findOne({ 
            where: { 
              email 
            } 
        });
        
        if (!user) {
          this.logger.warn(`No user found with email: ${email}`);
          throw new UnauthorizedException(
                `No user found for email: ${email}`
              );
        }

        this.logger.log(`User found, updating image for user ID: ${user.id}`);
        user.image = image;
        await this.userRepo.save(
           user
        );

        const newToken = this.jwtService.sign({ 
            id: user.id, 
        });
        this.logger.log(`New token generated for user ID: ${user.id}`);
        return {
            message: "Image changed",
            token: newToken
        }
    }
}
