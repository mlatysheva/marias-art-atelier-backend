import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';
import { PaintingsService } from './paintings.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'node:path';
import * as fs from 'fs';
import * as path from 'path';

@Controller('paintings')
export class PaintingsController {
  constructor(private readonly paintingsService: PaintingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPainting(
    @Body() body: CreatePaintingRequest,
    @CurrentUser() user: TokenPayload,
  ): Promise<any> {
    return this.paintingsService.createPainting(body, user.userId);
  }

  @Post(':paintingId/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('image', 10, {
      storage: diskStorage({
        destination: (req, _, cb) => {
          const paintingId = req.params.paintingId;
          const uploadPath = path.join(
            'public',
            'images',
            'paintings',
            paintingId,
          );

          // Create the folder for the images if it doesn't exist
          fs.mkdirSync(uploadPath, { recursive: true });

          cb(null, uploadPath);
        },
        filename: (_, file, callback) => {
          // Decode the filename from latin1 to utf8, relevant for Cyrillic characters
          const buffer = Buffer.from(file.originalname, 'latin1');
          const decodedName = buffer.toString('utf8');

          const ext = extname(decodedName);
          const name = decodedName.replace(ext, '');

          const finalName = `${name}${ext}`;

          callback(null, finalName);
        },
      }),
    }),
  )
  uploadPaintingImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/jpg',
          }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPaintings(@Query('status') status: string) {
    return this.paintingsService.getPaintings(status);
  }

  @Get(':paintingId')
  @UseGuards(JwtAuthGuard)
  async getPainting(@Param('paintingId') paintingId: string) {
    return await this.paintingsService.getPainting(paintingId);
  }
}
