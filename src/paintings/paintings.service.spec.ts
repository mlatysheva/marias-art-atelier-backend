import { Test, TestingModule } from '@nestjs/testing';
import { PaintingsService } from './paintings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaintingsGateway } from './paintings.gateway';

describe('PaintingsService', () => {
  let service: PaintingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaintingsService,
        {
          provide: PrismaService,
          useValue: {
            painting: {},
          },
        },
        {
          provide: PaintingsGateway,
          useValue: {
            handlePaintingUpdated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaintingsService>(PaintingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
