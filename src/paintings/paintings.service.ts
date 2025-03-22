import { Injectable } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaintingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPainting(data: CreatePaintingRequest, userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { medium, base, height, width, tags, ...rest } = data;

    // Format the incoming data to suit the Prisma schema
    const prismaData = {
      ...rest,
      tags: [...data.tags.split(', ')], // convert the string containing tags separated by a comma into an array of strings
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
