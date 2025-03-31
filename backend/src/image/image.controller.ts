import { Body, Controller, Put } from '@nestjs/common';
import { ImageService } from './image.service';
import { IsEmail, IsNotEmpty } from 'class-validator';

class ChangeImageDto{
  @IsEmail()
  email: string;

  @IsNotEmpty()
  image: string;
}

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Put('change-image')
    changeImage(@Body() body: ChangeImageDto){
      return this.imageService.changeImage(
        body.email,
        body.image
      );
  }
}
