import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImgurClient from 'imgur';

@Injectable()
export class ImageService {
  private readonly imgurClient: ImgurClient;
  constructor(private readonly configService: ConfigService) {
    const clientId = this.configService.get<string>('IMGUR_CLIENT_ID');
    if (!clientId) {
      throw new InternalServerErrorException('IMGUR_CLIENT_ID is not defined');
    }
    this.imgurClient = new ImgurClient({ clientId });
  }

  async uploadImage(imageFile: Express.Multer.File) {
    if (!imageFile) {
      throw new BadRequestException('no file uploaded');
    }

    // validate file size () max 5mb)
    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
      throw new BadRequestException('file is too large!');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      throw new BadRequestException(
        'Unsupported file type! Allowed types: JPEG, PNG, GIF.',
      );
    }

    try {
      const base64Image = imageFile.buffer.toString('base64');

      const res = await this.imgurClient.upload({
        image: base64Image,
      });

      if (!res.success) {
        throw new InternalServerErrorException(
          `Upload image failed with error: ${JSON.stringify(res.data)}`,
        );
      }

      return { link: res.data.link };
    } catch (error) {
      throw new InternalServerErrorException(
        `Upload image failed: ${error.message}`,
      );
    }
  }
}
