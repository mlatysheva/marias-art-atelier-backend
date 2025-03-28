import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';
import { PaintingsService } from './paintings.service';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post(':paintingId/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: 'public/paintings',
        filename: (req, file, callback) => {
          callback(
            null,
            `${req.params.paintingId}${extname(file.originalname)}`,
          );
        },
      }),
    }),
  )
  uploadPaintingImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50000 }),
          new FileTypeValidator({
            fileType: 'image/jpeg',
          }),
        ],
      }),
    )
    _file: Express.Multer.File,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPaintings() {
    return this.paintingsService.getPaintings();
  }
}
