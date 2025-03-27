import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { CurrentUser } from '../auth/current-user.decorator';
import { TokenPayload } from '../auth/token-payload.interface';
import { PaintingsService } from './paintings.service';

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

  @Get()
  @UseGuards(JwtAuthGuard)
  async getPaintings() {
    return this.paintingsService.getPaintings();
  }
}
