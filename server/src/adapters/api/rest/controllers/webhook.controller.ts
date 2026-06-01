import { Controller, Post, Req, Res, Headers, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { IPaymentUseCase } from 'src/application/use-cases/interface/payment.usecase.interface';

@Controller('webhook')
export class WebhookController {
  constructor(
   @Inject('IPaymentUseCase')
   private readonly _paymentUseCase: IPaymentUseCase
) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('Stripe-Signature') signature: string,
  ) {
    try {
      console.log('the payment request with the signature: ', signature)
      await this._paymentUseCase.handlePaymentEvent(req.body, signature);
      return res.json({ received: true });
    } catch (err) {
      return res.status(400).send(`Webhook Error!`);
    }
  }
}