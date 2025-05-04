import { Module } from '@nestjs/common';
import { PaintingsService } from './paintings.service';
import { PaintingsController } from './paintings.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PaintingsGateway } from './paintings.gateway';

@Module({
  imports: [PrismaModule],
  providers: [PaintingsService, PaintingsGateway],
  controllers: [PaintingsController],
  exports: [PaintingsService],
})
export class PaintingsModule {}
