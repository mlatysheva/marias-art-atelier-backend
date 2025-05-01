import { Module } from '@nestjs/common';
import { PaintingsService } from './paintings.service';
import { PaintingsController } from './paintings.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaintingsService],
  controllers: [PaintingsController],
  exports: [PaintingsService],
})
export class PaintingsModule {}
