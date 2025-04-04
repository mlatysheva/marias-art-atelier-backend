import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
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
        destination: 'public/paintings',
        filename: (req, file, callback) => {
          callback(
            null,
            `${req.params.paintingId}-${Date.now()}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  uploadPaintingImage(
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
  async getPaintings() {
    return this.paintingsService.getPaintings();
  }
}
