import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';

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

  async getPaintings() {
    const paintings = this.prismaService.painting.findMany();
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
}
