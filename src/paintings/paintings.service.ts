import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaintingRequest } from './dto/create-painting.request';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import path from 'path';
import { Prisma } from '@prisma/client';
import { PaintingsGateway } from './paintings.gateway';
import { UpdatePaintingRequest } from './dto/update-painting.request';

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
      tags: [...data.tags.split(', ')], // Convert the string containing tags separated by a comma into an array of strings
      dimensions: [data.width, data.height],
      materials: [data.medium, data.base],
    };
    const painting = await this.prismaService.painting.create({
      data: {
        ...prismaData,
        user: {
          connect: { id: userId }, // Associate painting with the user who uploaded it
        },
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

  async getPaintingsByUser(userId: string) {
    const paintings = this.prismaService.painting.findMany({
      where: { userId },
    });
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

  async updatePainting(
    paintingId: string,
    data: Partial<UpdatePaintingRequest>,
    userId: string,
  ) {
    const painting = await this.prismaService.painting.findUnique({
      where: { id: paintingId },
    });

    if (!painting) {
      throw new NotFoundException('Painting not found');
    }

    if (painting.userId !== userId) {
      throw new ForbiddenException(
        'Only the user who created the painting can update it',
      );
    }

    const { medium, base, height, width, price, tags, year, ...rest } = data;


    await this.prismaService.painting.update({
      where: {
        id: paintingId,
      },

      data: {
        ...rest,
        tags: [...tags?.split(', ') ?? []], 
        dimensions: [Number(width) ?? 0, Number(height) ?? 0],
        materials: [medium ?? '', base ?? ''],
        year: Number(year),
        price: Number(year),
        user: {
          connect: { id: userId }, // Associate painting with the user who uploaded it
        },
      },
    });

    this.paintingsGateway.handlePaintingUpdated();
    return painting;
  }

  async delete(id: string, userId: string) {
    const painting = await this.prismaService.painting.findUnique({ where: { id } });
    if (!painting) throw new NotFoundException('Painting not found');
    if (painting.userId !== userId) throw new ForbiddenException('Only the user who created the painting can delete it');

    return this.prismaService.painting.delete({ where: { id } });
  }
}
