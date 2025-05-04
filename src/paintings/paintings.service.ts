import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { PaintingsGateway } from './paintings.gateway';

@Injectable()
export class PaintingsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paintingsGateway: PaintingsGateway,
  ) {}

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
    const painting = await this.prismaService.painting.create({
      data: {
        ...prismaData,
        userId,
      },
    });

    this.paintingsGateway.handlePaintingUpdated();

    return painting;
  }

  async getPaintings(status?: string) {
    const args: Prisma.PaintingFindManyArgs = {};
    if (status === 'available') {
      args.where = {
        sold: false,
      };
    }
    const paintings = this.prismaService.painting.findMany(args);
    return Promise.all(
      (await paintings).map(async (painting) => {
        // Get the array of image file names
        const images = await this.getPaintingImages(painting.id);
        return {
          ...painting,
          images,
          imageExists: images.length > 0,
        };
      }),
    );
  }

  private async getPaintingImages(paintingId: string): Promise<string[]> {
    const folderPath = path.join(
      __dirname,
      '../..',
      'public/images/paintings',
      paintingId,
    );

    try {
      const folderExists = await fs
        .stat(folderPath)
        .then(() => true)
        .catch(() => false);
      if (!folderExists) {
        return [];
      }
      const files = await fs.readdir(folderPath);
      return files.filter((file) => /\.(jpe?g|png)$/i.test(file));
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  async getPainting(paintingId: string) {
    try {
      const painting = await this.prismaService.painting.findUniqueOrThrow({
        where: {
          id: paintingId,
        },
      });

      const images = await this.getPaintingImages(painting.id);
      return {
        ...painting,
        images,
        imageExists: images.length > 0,
      };
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`Painting ${paintingId} not found`);
    }
  }

  async update(paintingId: string, data: Prisma.PaintingUpdateInput) {
    await this.prismaService.painting.update({
      where: {
        id: paintingId,
      },
      data,
    });

    this.paintingsGateway.handlePaintingUpdated();
  }
}
