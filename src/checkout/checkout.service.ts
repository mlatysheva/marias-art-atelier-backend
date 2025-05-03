import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaintingsService } from '../paintings/paintings.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly stripe: Stripe,
    private readonly paintingsService: PaintingsService,
    private readonly configService: ConfigService,
  ) {}

  async createSession(paintingId: string) {
    const painting = await this.paintingsService.getPainting(paintingId);
    return this.stripe.checkout.sessions.create({
      metadata: {
        paintingId: painting.id,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: painting.price * 100,
            product_data: {
              name: painting.title,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: this.configService.getOrThrow('STRIPE_SUCCESS_URL'),
      cancel_url: this.configService.getOrThrow('STRIPE_CANCEL_URL'),
    });
  }

  async handleCheckoutWebhook(event: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (event.type !== 'checkout.session.completed') {
      return;
    }

    const session = await this.stripe.checkout.sessions.retrieve(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      event.data.object.id,
    );

    if (!session.metadata) {
      return;
    }
    await this.paintingsService.update(session.metadata.paintingId, {
      sold: true,
    });
  }
}
