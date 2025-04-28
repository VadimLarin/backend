import {
    Injectable,
    PipeTransform,
    BadRequestException,
  } from '@nestjs/common';
  import { Request } from 'express';
  import * as sharp from 'sharp';
  
  @Injectable()
  export class SharpPipe implements PipeTransform {
    async transform(file: Express.Multer.File) {
      if (!file) {
        throw new BadRequestException('Файл изображения обязателен');
      }
  
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Недопустимый формат изображения. Разрешены: JPEG, PNG, WEBP',
        );
      }
  
      try {
        const resizedImage = await sharp(file.buffer)
          .resize({
            width: 128,  // Ширина аватара в px
            height: 128, // Высота аватара в px
            fit: sharp.fit.cover,
          })
          .jpeg({ quality: 70 }) // Качество 
          .toBuffer();
  
        return resizedImage;
      } catch (error) {
        throw new BadRequestException('Ошибка обработки изображения');
      }
    }
  }
  