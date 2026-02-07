import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Stripe from 'stripe';
import { PaintingsService } from '../paintings/paintings.service';
import { CheckoutService } from './checkout.service';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let stripe: Stripe;
  let paintingsService: { markPaintingSold: jest.Mock };

  beforeEach(async () => {
    const webhookSecret = 'whsec_test_secret';
    stripe = new Stripe('sk_test_dummy');
    paintingsService = {
      markPaintingSold: jest.fn(),
    };

    const configService = {
      getOrThrow: jest.fn((key: string) => {
        if (key === 'STRIPE_WEBHOOK_SECRET') return webhookSecret;
        throw new Error(`Unexpected config key: ${key}`);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: Stripe, useValue: stripe },
        { provide: PaintingsService, useValue: paintingsService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('marks a painting as sold on checkout.session.completed', async () => {
    const payload = JSON.stringify({
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            paintingId: 'painting_123',
          },
        },
      },
    });

    const signature = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: 'whsec_test_secret',
    });

    await service.handleCheckoutWebhook(Buffer.from(payload), signature);

    expect(paintingsService.markPaintingSold).toHaveBeenCalledWith(
      'painting_123',
    );
  });

  it('rejects requests without a Stripe signature', async () => {
    const payload = JSON.stringify({ type: 'checkout.session.completed' });

    await expect(
      service.handleCheckoutWebhook(Buffer.from(payload)),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
