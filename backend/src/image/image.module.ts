import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt/jwt.strategy';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ImageController],
  providers: [ImageService, JwtStrategy],
  imports:[
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '24h' },
          }),
        }),
  ]
})
export class ImageModule {}
