import { Injectable } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaintingsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createPainting(data: CreatePaintingRequest, userId: string) {
    return this.prismaService.painting.create({
      data: {
        ...data,
        userId,
      },
    });
  }
}
