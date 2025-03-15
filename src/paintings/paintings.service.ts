import { Injectable } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaintingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPainting(data: CreatePaintingRequest, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { medium, base, height, width, ...rest } = data;

    // Format the incoming data to suit the Prisma schema
    const prismaData = {
      ...rest,
      dimensions: [data.width, data.height],
      materials: [data.medium, data.base],
    };
    return this.prismaService.painting.create({
      data: {
        ...prismaData,
        userId,
      },
    });
  }
}
